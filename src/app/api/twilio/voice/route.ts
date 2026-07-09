import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { getAgentResponse, logCall, getTwilioConfig } from '@/lib/twilio-helper'

/**
 * POST /api/twilio/voice
 *
 * Handles incoming Twilio voice calls.
 *
 * Flow:
 *  1. First request (no SpeechResult/Digits): Greet + gather input
 *  2. Subsequent requests (with SpeechResult/Digits): AI response + gather again
 *  3. If caller says goodbye or hangs up: end call
 *
 * Twilio sends form-urlencoded data. We respond with TwiML XML.
 */
export async function POST(request: NextRequest) {
  try {
    const config = getTwilioConfig()
    if (!config) {
      console.error('[Twilio Voice] Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER in .env')
      const reject = twilio.twiml.VoiceResponse()
      reject.reject()
      reject.say('We are currently experiencing technical difficulties. Please call back later.')
      return new NextResponse(reject.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const formData = await request.formData()
    const callSid = formData.get('CallSid') as string || ''
    const from = formData.get('From') as string || ''
    const to = formData.get('To') as string || ''
    const callStatus = formData.get('CallStatus') as string || 'in-progress'
    const speechResult = (formData.get('SpeechResult') as string) || ''
    const digits = (formData.get('Digits') as string) || ''

    // Determine what the caller said or pressed
    const userInput = speechResult || digits || ''

    // Log the initial incoming call
    if (!userInput && callStatus === 'ringing') {
      await logCall({
        customerPhone: from,
        direction: 'inbound',
        status: 'completed', // will be updated by status callback
        notes: `Twilio Call SID: ${callSid}`,
        twilioCallSid: callSid,
      })
    }

    const VoiceResponse = twilio.twiml.VoiceResponse
    const twiml = new VoiceResponse()

    // ─── First request: Greet and gather ────────────────────────────────
    if (!userInput) {
      twiml.say(
        { voice: 'Polly.Joanna', speed: '1.0' },
        'Hello! Thank you for calling. How can I help you today? You can ask about our services, book an appointment, or say schedule to make a booking.'
      )

      const gather = twiml.gather({
        input: ['speech', 'dtmf'],
        action: '/api/twilio/voice',
        method: 'POST',
        timeout: 5,
        speechTimeout: 'auto',
        numDigits: 1,
        actionOnEmptyResult: true,
      })

      gather.say(
        { voice: 'Polly.Joanna' },
        'Go ahead, I am listening.'
      )

      // If no input after timeout, redirect back to self (loop)
      twiml.redirect('/api/twilio/voice?CallSid=' + encodeURIComponent(callSid) + '&From=' + encodeURIComponent(from))

      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // ─── Subsequent request: Process user input with AI ─────────────────
    const goodbyePhrases = ['goodbye', 'bye', 'that is all', 'that\'s all', 'nothing else', 'hang up', 'no thank', 'no thanks']
    const isGoodbye = goodbyePhrases.some((phrase) => userInput.toLowerCase().includes(phrase))

    if (isGoodbye) {
      twiml.say(
        { voice: 'Polly.Joanna' },
        'Thank you for calling! Have a great day. Goodbye!'
      )
      twiml.hangup()
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Call the AI agent
    const aiResponse = await getAgentResponse(userInput, {
      phone: from,
    })

    // Speak the AI response
    twiml.say(
      { voice: 'Polly.Joanna', speed: '1.0' },
      aiResponse
    )

    // Gather again for the next turn
    const gather = twiml.gather({
      input: ['speech', 'dtmf'],
      action: '/api/twilio/voice',
      method: 'POST',
      timeout: 5,
      speechTimeout: 'auto',
      numDigits: 1,
      actionOnEmptyResult: true,
    })

    gather.say(
      { voice: 'Polly.Joanna' },
      'Is there anything else I can help you with?'
    )

    // If they say nothing, say goodbye
    twiml.say(
      { voice: 'Polly.Joanna' },
      'I did not catch that. Thank you for calling! Goodbye.'
    )

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('[Twilio Voice] Error:', error)
    const VoiceResponse = twilio.twiml.VoiceResponse
    const errorTwiml = new VoiceResponse()
    errorTwiml.say('Sorry, we are experiencing a technical issue. Please call back later.')
    errorTwiml.hangup()
    return new NextResponse(errorTwiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}