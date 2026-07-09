import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { getTwilioConfig, logCall } from '@/lib/twilio-helper'
import { db } from '@/lib/db'

/**
 * POST /api/twilio/outbound
 *
 * Initiates outbound calls or sends SMS messages from the HYDRAGENT dashboard.
 *
 * Body:
 *   { "type": "call" | "sms", "to": "+1234567890", "message"?: "text for SMS" }
 */
export async function POST(request: NextRequest) {
  try {
    const config = getTwilioConfig()
    if (!config) {
      return NextResponse.json(
        { error: 'Twilio not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your .env file.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { type, to, message } = body

    if (!type || !to) {
      return NextResponse.json(
        { error: 'type ("call" or "sms") and "to" (phone number) are required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    const cleanTo = to.replace(/[^+\d]/g, '')
    if (!cleanTo.startsWith('+')) {
      return NextResponse.json(
        { error: 'Phone number must be in E.164 format, e.g. +1234567890' },
        { status: 400 }
      )
    }

    const client = twilio(config.accountSid, config.authToken)

    if (type === 'sms') {
      // ─── Send SMS ─────────────────────────────────────────────────
      if (!message || typeof message !== 'string') {
        return NextResponse.json(
          { error: 'message is required for SMS' },
          { status: 400 }
        )
      }

      const sms = await client.messages.create({
        body: message.substring(0, 1600), // Twilio SMS limit
        from: config.phoneNumber,
        to: cleanTo,
      })

      // Log as email record for tracking
      await db.emailRecord.create({
        data: {
          from: config.phoneNumber,
          to: cleanTo,
          subject: `[Outbound SMS to ${cleanTo}]`,
          body: message,
          direction: 'outbound',
          status: 'sent',
        },
      })

      console.log(`[Twilio Outbound] SMS sent to ${cleanTo}, SID: ${sms.sid}`)

      return NextResponse.json({
        success: true,
        type: 'sms',
        sid: sms.sid,
        status: sms.status,
        to: cleanTo,
      })

    } else if (type === 'call') {
      // ─── Make Outbound Call ───────────────────────────────────────
      const webhookBase = process.env.TWILIO_WEBHOOK_BASE || process.env.NEXT_PUBLIC_APP_URL || ''

      const call = await client.calls.create({
        to: cleanTo,
        from: config.phoneNumber,
        // Use the same voice webhook handler
        url: `${webhookBase}/api/twilio/voice`,
        statusCallback: `${webhookBase}/api/twilio/status`,
        statusCallbackMethod: 'POST',
      })

      // Log the outbound call
      await logCall({
        customerPhone: cleanTo,
        direction: 'outbound',
        status: 'scheduled',
        notes: `Outbound call initiated. Twilio SID: ${call.sid}`,
        twilioCallSid: call.sid,
      })

      console.log(`[Twilio Outbound] Call initiated to ${cleanTo}, SID: ${call.sid}`)

      return NextResponse.json({
        success: true,
        type: 'call',
        sid: call.sid,
        status: call.status,
        to: cleanTo,
      })

    } else {
      return NextResponse.json(
        { error: 'type must be "call" or "sms"' },
        { status: 400 }
      )
    }
  } catch (error: unknown) {
    console.error('[Twilio Outbound] Error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to send: ${msg}` },
      { status: 500 }
    )
  }
}