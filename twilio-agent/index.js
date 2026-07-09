const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

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
  // You could also use <Gather> to get input, etc.

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Agent listening at http://localhost:${PORT}`);
});
