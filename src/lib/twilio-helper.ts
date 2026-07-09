import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

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

  // 3. Get recent chat history for context (last 10)
  const historyMessages = await db.chatMessage.findMany({
    orderBy: { createdAt: 'asc' },
    take: 10,
  })

  const chatHistory = historyMessages.map((msg) => ({
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

RULES:
- Keep responses short (1-3 sentences for voice, 1-2 for SMS)
- If the caller wants to book, ask for their name, preferred date/time, and service
- If you don't know something, offer to take a message
- For voice: speak naturally, don't use markdown or special characters
- For SMS: you can use some emoji if appropriate
- Always be helpful and polite
${callerInfo?.name ? `- The caller's name is ${callerInfo.name}` : ''}
${callerInfo?.phone ? `- The caller's number is ${callerInfo.phone}` : ''}`

  // 5. Call LLM
  const zai = await ZAI.create()
  const result = await zai.chat.completions.create({
    model: 'default',
    messages: [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: userMessage },
    ],
  })

  const response = result.choices?.[0]?.message?.content ?? 'I apologize, I was unable to process that. Could you please repeat?'

  // 6. Save to chat history
  await db.chatMessage.create({
    data: { role: 'user', content: `[Phone/SMS] ${callerInfo?.phone || ''}: ${userMessage}` },
  })
  await db.chatMessage.create({
    data: { role: 'assistant', content: response },
  })

  return response
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