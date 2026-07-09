import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/twilio/status
 *
 * Receives Twilio call status callbacks.
 * Updates the call log in the database with the final status and duration.
 *
 * Twilio sends these automatically when you configure status callbacks.
 * Add this URL to your Twilio number's voice config:
 *   Status Callback: https://your-domain.com/api/twilio/status
 *   Status Callback Method: POST
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const callSid = (formData.get('CallSid') as string) || ''
    const callStatus = (formData.get('CallStatus') as string) || ''
    const from = (formData.get('From') as string) || ''
    const to = (formData.get('To') as string) || ''
    const duration = (formData.get('CallDuration') as string) || ''
    const callerName = (formData.get('CallerName') as string) || ''

    console.log(`[Twilio Status] Call ${callSid}: ${callStatus} | Duration: ${duration}s | From: ${from}`)

    // Find the most recent call log for this phone number
    // We match by customerPhone since we don't store TwilioCallSid in the schema
    if (from) {
      const recentCall = await db.callLog.findFirst({
        where: {
          customerPhone: from,
          direction: 'inbound',
        },
        orderBy: { createdAt: 'desc' },
      })

      if (recentCall) {
        // Map Twilio status to our status
        let mappedStatus = recentCall.status
        if (callStatus === 'completed') mappedStatus = 'completed'
        else if (callStatus === 'no-answer' || callStatus === 'failed') mappedStatus = 'missed'
        else if (callStatus === 'busy') mappedStatus = 'missed'
        else if (callStatus === 'canceled') mappedStatus = 'missed'

        const durationSeconds = duration ? parseInt(duration) : null

        await db.callLog.update({
          where: { id: recentCall.id },
          data: {
            status: mappedStatus,
            duration: durationSeconds,
            notes: recentCall.notes
              ? `${recentCall.notes}\n[Twilio: ${callStatus}, duration ${duration}s, SID: ${callSid}]`
              : `[Twilio: ${callStatus}, duration ${duration}s, SID: ${callSid}]`,
          },
        })

        console.log(`[Twilio Status] Updated call log ${recentCall.id} → ${mappedStatus}, ${duration}s`)
      }
    }

    // Always return 200 to Twilio (they don't process the response body)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('[Twilio Status] Error:', error)
    // Still return 200 so Twilio doesn't retry
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}