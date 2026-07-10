import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'
import twilio from 'twilio'

/**
 * Fetch the business profile and active knowledge docs,
 * build a system prompt, and call the LLM with the user's message.
 * Returns the assistant's text response.
 */
export async function getAgentResponse(
  userMessage: string,
  callerInfo?: { name?: string; phone?: string }
): Promise<string> {
  // 1. Get business info
  const business = await db.business.findFirst()

  // 2. Get active knowledge docs
  const knowledgeDocs = await db.knowledgeDoc.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  const knowledgeContext = knowledgeDocs
    .map((doc) => `--- ${doc.title} ---\n${doc.content}`)
    .join('\n\n')

  // 3. Get recent chat history for context (last 10 for THIS caller)
  const historyMessages = await db.chatMessage.findMany({
    where: callerInfo?.phone ? {
      content: { contains: `[Phone/SMS] ${callerInfo.phone}:` }
    } : {},
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Lead Awareness Check: See if this user is an unconverted booking lead
  let leadContext = ''
  if (callerInfo?.phone) {
    const lead = await db.bookingLead.findUnique({ where: { id: callerInfo.phone } })
    if (lead && !lead.isConverted) {
      leadContext = `\nIMPORTANT: This user is a "Pending Lead". They previously expressed interest in booking but didn't finish. Gently remind them and ask if they'd like to complete their appointment now.`
    }
  }

  const chatHistory = historyMessages
    .reverse() // Ensure chronological order for LLM
    .map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }))

  // 4. Build system prompt
  const businessName = business?.name || 'our business'
  const businessType = business?.type || 'appointment-based'
  const businessHours = business?.hours || 'Not specified'
  const businessPhone = business?.phone || 'Not specified'
  const businessEmail = business?.email || 'Not specified'
  const businessAddress = business?.address || 'Not specified'

  const systemPrompt = `You are the AI phone/SMS assistant for "${businessName}", a ${businessType} business.

YOUR JOB: Help the caller/texter with scheduling appointments, answering questions about services, and providing business information. Be friendly, professional, and concise — this is a phone/SMS conversation, so keep responses brief and conversational.

BUSINESS INFORMATION:
- Name: ${businessName}
- Type: ${businessType}
- Hours: ${businessHours}
- Phone: ${businessPhone}
- Email: ${businessEmail}
- Address: ${businessAddress}
${business?.description ? `- Description: ${business.description}` : ''}

KNOWLEDGE BASE:
${knowledgeContext || 'No knowledge base documents available.'}
${leadContext}

RULES:
- Keep responses short (1-3 sentences for voice, 1-2 for SMS)
- If the caller wants to book, ask for their name, preferred date/time, and service
- IMPORTANT: Once you have the NAME, DATE/TIME, and SERVICE, you MUST trigger a booking by starting your response with: "BOOK_APPOINTMENT|Name|DateTime|Service" followed by a friendly confirmation message.
- Example: "BOOK_APPOINTMENT|John Doe|2026-07-10 10:00|Oil Change. Great, John! I've booked your oil change for July 10th at 10 AM."
- PANIC BUTTON: If the customer is frustrated, asks for a "real person", "human", "manager", or something you cannot handle, you MUST trigger a hand-off by starting your response with: "HANDOFF_HUMAN|Reason" followed by a message telling the user you are connecting them.
- Example: "HANDOFF_HUMAN|Customer is angry about pricing. I'm connecting you with a member of our team right now. Please hold."
- If you don't know something, offer to take a message
- For voice: speak naturally, don't use markdown or special characters
- For SMS: you can use some emoji if appropriate
- Always be helpful and polite
${callerInfo?.name ? `- The caller's name is ${callerInfo.name}` : ''}
${callerInfo?.phone ? `- The caller's number is ${callerInfo.phone}` : ''}`

  // 5. Call LLM
  try {
    const zai = await ZAI.create()
    const result = await zai.chat.completions.create({
      model: 'default',
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: userMessage },
      ],
    })

    const responseRaw = result.choices?.[0]?.message?.content ?? 'I apologize, I was unable to process that. Could you please repeat?'

    let response = responseRaw

    // 1. Lead Recovery Tracking
    // If the AI is asking for booking info (detected by keywords in response), track as a lead
    if (responseRaw.toLowerCase().includes('book') || responseRaw.toLowerCase().includes('appointment') || responseRaw.toLowerCase().includes('schedule')) {
      await db.bookingLead.upsert({
        where: { id: callerInfo?.phone || 'unknown' }, // Simplified: use phone as ID for lead tracking
        update: { lastContacted: new Date() },
        create: { 
          id: callerInfo?.phone || 'unknown', 
          customerPhone: callerInfo?.phone || 'unknown',
          lastContacted: new Date() 
        },
      })
    }

    // Handle Booking Trigger
    if (responseRaw.startsWith('BOOK_APPOINTMENT|')) {
      try {
        const [trigger, name, dateTime, service, ...rest] = responseRaw.split('|')
        const confirmationMsg = rest.join('|').trim()

        // Convert AI's date string to JS Date
        const bookingDate = new Date(dateTime)
        if (!isNaN(bookingDate.getTime())) {
          await db.appointment.create({
            data: {
              customerName: name,
              customerPhone: callerInfo?.phone || null,
              service: service,
              date: bookingDate,
              status: 'scheduled',
            },
          })
          
          // Mark lead as converted
          if (callerInfo?.phone) {
            await db.bookingLead.update({
              where: { id: callerInfo.phone },
              data: { isConverted: true }
            })
          }

          // Use the confirmation message from AI, or a default one
          response = confirmationMsg || `Great! I've booked your ${service} for ${dateTime}.`
        } else {
          console.error('[Booking Error] Invalid date received from AI:', dateTime)
          response = 'I had some trouble processing the date. Could you please tell me again when you would like to come in?'
        }
      } catch (e) {
        console.error('[Booking Error] Failed to create appointment:', e)
        response = 'I encountered an error while booking. Please try again or leave a message.'
      }
    } else if (responseRaw.startsWith('HANDOFF_HUMAN|')) {
      try {
        const [trigger, reason, ...rest] = responseRaw.split('|')
        const handoffMsg = rest.join('|').trim()

        // 🚨 EMERGENCY NOTIFICATION to Business Owner
        const twilioConfig = getTwilioConfig()
        if (twilioConfig) {
          const client = twilio(twilioConfig.accountSid, twilioConfig.authToken)
          await client.messages.create({
            body: `🚨 URGENT HANDOFF: ${reason}\nCustomer: ${callerInfo?.phone || 'Unknown'}\nAI is attempting to connect them now.`,
            from: twilioConfig.phoneNumber,
            to: businessPhone,
          })
        }

        response = handoffMsg || 'I am connecting you with a member of our team right now. Please hold.'
      } catch (e) {
        console.error('[Handoff Error] Failed to send emergency notification:', e)
        response = 'I am having trouble connecting you to a human right now, but I have notified my manager. Please hold.'
      }
    }

    // 6. Save to chat history
    await db.chatMessage.create({
      data: { role: 'user', content: `[Phone/SMS] ${callerInfo?.phone || ''}: ${userMessage}` },
    })
    await db.chatMessage.create({
      data: { role: 'assistant', content: response },
    })

    return response
  } catch (error) {
    console.error('[AgentResponse Error]:', error)
    return 'I am sorry, I am having a little trouble connecting right now. Please try again in a moment or leave a message.'
  }
}

/**
 * Log a call to the database
 */
export async function logCall(data: {
  customerName?: string | null
  customerPhone: string
  direction: string
  duration?: number | null
  status: string
  notes?: string | null
  recordingUrl?: string | null
  twilioCallSid?: string
}) {
  return db.callLog.create({
    data: {
      customerName: data.customerName || null,
      customerPhone: data.customerPhone,
      direction: data.direction,
      duration: data.duration ?? null,
      status: data.status,
      notes: data.notes || null,
      recordingUrl: data.recordingUrl || null,
    },
  })
}

/**
 * Validate that Twilio credentials are configured
 */
export function getTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !phoneNumber) {
    return null
  }

  return { accountSid, authToken, phoneNumber }
}