const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Correct path to root .env

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Debugging: Check if env vars are loaded
console.log('--- Environment Check ---');
console.log('TWILIO_ACCOUNT_SID loaded:', !!process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_AUTH_TOKEN loaded:', !!process.env.TWILIO_AUTH_TOKEN);
console.log('TWILIO_PHONE_NUMBER loaded:', !!process.env.TWILIO_PHONE_NUMBER);
console.log('-------------------------');

// Initialize Twilio Client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Incoming SMS webhook
app.post('/sms', (req, res) => {
  const from = req.body.From;      // sender's phone number
  const body = req.body.Body;      // text they sent

  console.log(`SMS from ${from}: ${body}`);

  // Create a TwiML response
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(`Hello! You said: "${body}". I'm your agent.`);

  // Set content type to XML
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// Incoming voice call webhook
app.post('/voice', (req, res) => {
  const from = req.body.From;
  console.log(`Call from ${from}`);

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({ voice: 'alice' }, 'Hi, this is your agent. How can I help you?');

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// Test route to verify credentials and send a message
app.get('/test-sms', async (req, res) => {
  const to = req.query.to;
  const message = req.query.message || 'Test message from Hydragent!';

  if (!to) {
    return res.status(400).send('Please provide a "to" phone number. Example: /test-sms?to=+1234567890');
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    res.send(`Message sent successfully! SID: ${result.sid}`);
  } catch (error) {
    console.error('Twilio Error:', error);
    res.status(500).send(`Failed to send message: ${error.message}`);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Agent listening at http://localhost:${PORT}`);
  console.log(`Test your setup: http://localhost:${PORT}/test-sms?to=YOUR_PHONE_NUMBER`);
});
