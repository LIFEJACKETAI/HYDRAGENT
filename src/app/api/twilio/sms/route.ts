import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { getAgentResponse, getTwilioConfig } from '@/lib/twilio-helper'
import { db } from '@/lib/db'

/**
 * POST /api/twilio/sms
 *
 * Handles incoming Twilio SMS messages.
 * Sends the message to the AI agent and replies via SMS.
 *
 * Twilio sends form-urlencoded data. We respond with TwiML XML.
 */
export async function POST(request: NextRequest) {
  try {
    const config = getTwilioConfig()
    if (!config) {
      console.error('[Twilio SMS] Missing TWILIO credentials in .env')
      const MessagingResponse = twilio.twiml.MessagingResponse
      const msg = new MessagingResponse()
      msg.message('Sorry, this service is not configured yet. Please contact the business directly.')
      return new NextResponse(msg.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const formData = await request.formData()
    const from = (formData.get('From') as string) || ''
    const to = (formData.get('To') as string) || ''
    const body = (formData.get('Body') as string) || ''
    const messageSid = (formData.get('MessageSid') as string) || ''
    const numMedia = parseInt(formData.get('NumMedia') as string) || 0

    console.log(`[Twilio SMS] From: ${from}, To: ${to}, Body: "${body}"`)

    // Log the inbound SMS as an email-like record for tracking
    await db.emailRecord.create({
      data: {
        from: from,
        to: to,
        subject: `[SMS from ${from}]`,
        body: body,
        direction: 'inbound',
        status: 'received',
      },
    })

    // Get AI response
    const aiResponse = await getAgentResponse(body, {
      phone: from,
    })

    // Send SMS reply via TwiML
    const MessagingResponse = twilio.twiml.MessagingResponse
    const twiml = new MessagingResponse()

    // Twilio SMS has a 1600 char limit per segment; trim if needed
    const maxSmsLength = 1500
    const trimmedResponse =
      aiResponse.length > maxSmsLength
        ? aiResponse.substring(0, maxSmsLength).trim() + '...'
        : aiResponse

    twiml.message(trimmedResponse)

    console.log(`[Twilio SMS] Reply sent to ${from}: "${trimmedResponse.substring(0, 80)}..."`)

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('[Twilio SMS] Error:', error)
    const MessagingResponse = twilio.twiml.MessagingResponse
    const msg = new MessagingResponse()
    msg.message('Sorry, something went wrong. Please try again or call us directly.')
    return new NextResponse(msg.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}