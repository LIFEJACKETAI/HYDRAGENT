import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Clear existing data
    await db.chatMessage.deleteMany()
    await db.emailRecord.deleteMany()
    await db.callLog.deleteMany()
    await db.appointment.deleteMany()
    await db.integration.deleteMany()
    await db.knowledgeDoc.deleteMany()
    await db.business.deleteMany()

    // --- Business ---
    const business = await db.business.create({
      data: {
        name: 'Sunshine Dental Clinic',
        type: 'dentist',
        description:
          'A family-friendly dental clinic offering comprehensive oral care services including general dentistry, cosmetic procedures, and emergency dental care.',
        address: '1234 Sunshine Blvd, Suite 200, San Diego, CA 92101',
        phone: '(619) 555-0187',
        email: 'info@sunshinedental.com',
        website: 'https://www.sunshinedental.com',
        hours: JSON.stringify({
          monday: '8:00 AM - 6:00 PM',
          tuesday: '8:00 AM - 6:00 PM',
          wednesday: '8:00 AM - 6:00 PM',
          thursday: '8:00 AM - 5:00 PM',
          friday: '8:00 AM - 3:00 PM',
          saturday: '9:00 AM - 1:00 PM',
          sunday: 'Closed',
        }),
        logoUrl: '',
        primaryColor: '#0d9488',
        accentColor: '#f59e0b',
        widgetPosition: 'bottom-right',
        widgetGreeting: 'Hi! Welcome to Sunshine Dental. How can I help you today?',
      },
    })

    // --- Knowledge Docs ---
    const knowledgeDocs = await Promise.all([
      db.knowledgeDoc.create({
        data: {
          title: 'Services Offered',
          content: `Sunshine Dental Clinic offers a comprehensive range of dental services:

1. General Dentistry
   - Dental exams and cleanings (starting at $99)
   - Fillings (composite: $150-$350)
   - Root canal treatments ($800-$1,500)
   - Tooth extractions ($200-$500)
   - Dental crowns ($800-$1,200)
   - Dental bridges ($2,000-$4,000)

2. Cosmetic Dentistry
   - Teeth whitening (in-office: $500, take-home: $200)
   - Porcelain veneers ($900-$2,500 per tooth)
   - Dental bonding ($300-$600 per tooth)
   - Smile makeovers (custom pricing)

3. Orthodontics
   - Traditional metal braces ($3,000-$7,000)
   - Clear aligners / Invisalign ($3,500-$8,000)
   - Retainers ($200-$500)

4. Preventive Care
   - Fluoride treatments ($25-$50)
   - Dental sealants ($30-$60 per tooth)
   - Oral cancer screenings (included in exam)
   - Night guards ($300-$600)

5. Emergency Dental Care
   - Same-day emergency appointments available
   - Weekend emergency hours on Saturday 9 AM - 1 PM`,
          fileType: 'text',
          fileSize: 850,
          source: 'manual',
          isActive: true,
        },
      }),
      db.knowledgeDoc.create({
        data: {
          title: 'Pricing & Payment Options',
          content: `Pricing & Payment Information:

PAYMENT METHODS:
- We accept all major credit cards (Visa, MasterCard, American Express, Discover)
- Debit cards, cash, and personal checks
- CareCredit financing available (0% APR for 6-12 months on qualifying purchases)
- HSA/FSA accounts accepted

INSURANCE:
- We are in-network with most major dental insurance plans
- Accepted plans include: Delta Dental, Cigna, Aetna, MetLife, Guardian, United Healthcare, Blue Cross Blue Shield
- We will file your insurance claim on your behalf
- Co-pays and deductibles are due at time of service

NEW PATIENT SPECIALS:
- First exam + cleaning + X-rays: $99 (regularly $250+)
- Free consultation for cosmetic procedures
- Complimentary second opinion

PAYMENT PLANS:
- We offer flexible payment plans for treatments over $500
- 0% interest financing for 6 months on approved credit
- 20% discount for patients paying in full at time of service for treatments over $1,000`,
          fileType: 'text',
          fileSize: 720,
          source: 'manual',
          isActive: true,
        },
      }),
      db.knowledgeDoc.create({
        data: {
          title: 'Insurance Information',
          content: `Insurance & Billing Details:

IN-NETWORK PROVIDERS:
- Delta Dental PPO & Premier
- Cigna Dental
- Aetna Dental
- MetLife Dental
- Guardian Dental
- United Healthcare Dental
- Blue Cross Blue Shield Dental
- Humana Dental
- Ameritas Dental

OUT-OF-NETWORK BENEFITS:
- We still see patients with out-of-network insurance
- We will help you maximize your out-of-network benefits
- You may receive reimbursement directly from your insurance company

INSURANCE FAQ:
Q: Do you verify my insurance before my appointment?
A: Yes! Please provide your insurance information when booking, and we will verify your benefits before your visit.

Q: What if I don't have dental insurance?
A: We offer our Sunshine Savings Plan for uninsured patients - $299/year includes 2 cleanings, 2 exams, X-rays, and 15% off all other services.

Q: How do co-pays work?
A: Your co-pay amount depends on your specific plan. We will inform you of any out-of-pocket costs before treatment begins.

Q: Do you offer discounts for seniors or families?
A: Yes! Seniors (65+) receive 10% off. Family plans available for 3+ members - ask about our family discount.`,
          fileType: 'text',
          fileSize: 980,
          source: 'manual',
          isActive: true,
        },
      }),
      db.knowledgeDoc.create({
        data: {
          title: 'Aftercare Instructions',
          content: `Post-Treatment Care Instructions:

AFTER A FILLING:
- Avoid eating for 2 hours after the procedure
- Avoid hot/cold foods for 24 hours if you experience sensitivity
- Take ibuprofen (400-600mg) for any discomfort
- Brush and floss normally, but be gentle around the filled tooth
- Call us if the bite feels "high" or uneven

AFTER A TOOTH EXTRACTION:
- Bite down on gauze for 30-45 minutes after the procedure
- Do not rinse, spit, or use a straw for 24 hours (prevents dry socket)
- Apply ice packs to the outside of your face for 20 minutes on, 20 minutes off
- Eat soft foods for the first 2-3 days (yogurt, soup, mashed potatoes, smoothies)
- Take prescribed pain medication as directed
- Avoid strenuous activity for 48 hours
- Call us immediately if bleeding persists beyond 4 hours or you develop a fever

AFTER TEETH WHITENING:
- Avoid coffee, tea, red wine, and dark-colored foods for 48 hours
- Use a white-straw for beverages if possible
- Brush with a sensitivity toothpaste if you experience sensitivity
- Results typically last 6-12 months with proper care

AFTER ROOT CANAL:
- Take prescribed antibiotics and pain medication as directed
- Avoid chewing on the treated side until the crown is placed
- Mild discomfort is normal for 3-5 days
- Call us if you experience severe pain, swelling, or fever`,
          fileType: 'text',
          fileSize: 1200,
          source: 'manual',
          isActive: true,
        },
      }),
      db.knowledgeDoc.create({
        data: {
          title: 'Frequently Asked Questions',
          content: `Frequently Asked Questions:

Q: How do I book an appointment?
A: You can book online through our website, call us at (619) 555-0187, or use our chat assistant right here! We also accept walk-ins for emergencies.

Q: What should I bring to my first appointment?
A: Please bring a valid photo ID, your insurance card, a list of current medications, and any relevant dental records or X-rays from your previous dentist.

Q: How often should I visit the dentist?
A: We recommend a check-up and cleaning every 6 months for most patients. Patients with gum disease or other conditions may need more frequent visits.

Q: Do you see children?
A: Yes! We welcome patients of all ages, including children. We recommend a first dental visit by age 1 or when the first tooth appears.

Q: What if I have a dental emergency?
A: Call us immediately at (619) 555-0187. We offer same-day emergency appointments. After hours, follow our voicemail instructions for the on-call dentist.

Q: Do you offer sedation dentistry?
A: Yes! We offer nitrous oxide (laughing gas) and oral sedation for anxious patients. Please let us know when booking if you have dental anxiety.

Q: How long do appointments typically take?
A: A standard cleaning and exam takes 45-60 minutes. More complex procedures may take 1-2 hours. We will give you a time estimate when you book.

Q: What is your cancellation policy?
A: We require 24-hour notice for cancellations. Late cancellations or no-shows may be subject to a $50 fee.

Q: Is parking available?
A: Yes, we have free parking in our building's lot. Street parking is also available on Sunshine Blvd.

Q: Do you offer virtual consultations?
A: Yes, we offer telehealth consultations for certain conditions. Book a virtual visit through our website or by calling our office.`,
          fileType: 'text',
          fileSize: 1400,
          source: 'manual',
          isActive: true,
        },
      }),
    ])

    // --- Appointments (spread over next 2 weeks) ---
    const now = new Date()
    const appointments = await Promise.all([
      db.appointment.create({
        data: {
          customerName: 'Maria Rodriguez',
          customerEmail: 'maria.rodriguez@email.com',
          customerPhone: '(619) 555-0234',
          service: 'Teeth Cleaning',
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0),
          duration: 45,
          status: 'confirmed',
          notes: 'Regular 6-month checkup',
        },
      }),
      db.appointment.create({
        data: {
          customerName: 'James Chen',
          customerEmail: 'jchen@email.com',
          customerPhone: '(619) 555-0456',
          service: 'Root Canal Treatment',
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0),
          duration: 90,
          status: 'scheduled',
          notes: 'Tooth #14, patient reported sensitivity to hot/cold',
        },
      }),
      db.appointment.create({
        data: {
          customerName: 'Sarah Thompson',
          customerEmail: 'sarah.t@email.com',
          customerPhone: '(858) 555-0789',
          service: 'Teeth Whitening (In-Office)',
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 9, 0),
          duration: 60,
          status: 'confirmed',
          notes: 'Wedding in 3 weeks, wants bright smile',
        },
      }),
      db.appointment.create({
        data: {
          customerName: 'David Kim',
          customerPhone: '(760) 555-0321',
          service: 'Emergency - Toothache',
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 11, 30),
          duration: 30,
          status: 'completed',
          notes: 'Pain in lower right molar. Prescribed antibiotics. Follow-up needed.',
        },
      }),
      db.appointment.create({
        data: {
          customerName: 'Emily Watson',
          customerEmail: 'ewatson@email.com',
          customerPhone: '(619) 555-0654',
          service: 'Dental Crown Fitting',
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 13, 0),
          duration: 60,
          status: 'scheduled',
          notes: 'Crown prep done last week, permanent crown placement',
        },
      }),
      db.appointment.create({
        data: {
          customerName: 'Michael Brown',
          customerPhone: '(619) 555-0987',
          service: 'Dental Exam',
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 15, 0),
          duration: 30,
          status: 'no-show',
          notes: 'Patient did not show. Called twice, no answer.',
        },
      }),
      db.appointment.create({
        data: {
          customerName: 'Lisa Patel',
          customerEmail: 'lisa.patel@email.com',
          customerPhone: '(858) 555-0147',
          service: 'Invisalign Consultation',
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 10, 30),
          duration: 45,
          status: 'scheduled',
          notes: 'Interested in clear aligners for minor crowding',
        },
      }),
      db.appointment.create({
        data: {
          customerName: 'Robert Garcia',
          customerEmail: 'rgarcia@email.com',
          customerPhone: '(619) 555-0258',
          service: 'Tooth Extraction',
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 8, 0),
          duration: 45,
          status: 'scheduled',
          notes: 'Wisdom tooth #32, surgical extraction. Requires X-ray review.',
        },
      }),
    ])

    // --- Email Records ---
    const emailRecords = await Promise.all([
      db.emailRecord.create({
        data: {
          from: 'maria.rodriguez@email.com',
          to: 'info@sunshinedental.com',
          subject: 'Appointment Confirmation - Maria Rodriguez',
          body: 'Thank you for booking your appointment for Teeth Cleaning on tomorrow at 10:00 AM. Please arrive 10 minutes early to complete any necessary paperwork.',
          direction: 'outbound',
          status: 'sent',
        },
      }),
      db.emailRecord.create({
        data: {
          from: 'jchen@email.com',
          to: 'info@sunshinedental.com',
          subject: 'Questions about root canal procedure',
          body: 'Hi, I have an appointment scheduled for a root canal next week. I wanted to ask about the procedure - will I be under anesthesia? How long will it take? Also, do you accept my Cigna insurance? Thank you, James',
          direction: 'inbound',
          status: 'received',
          appointmentId: appointments[1].id,
        },
      }),
      db.emailRecord.create({
        data: {
          from: 'info@sunshinedental.com',
          to: 'jchen@email.com',
          subject: 'Re: Questions about root canal procedure',
          body: 'Hi James, thank you for reaching out. Yes, we use local anesthesia for the procedure so you will be comfortable throughout. The appointment is scheduled for 90 minutes. We are in-network with Cigna, so your root canal should be partially covered. Please let us know if you have any other questions!',
          direction: 'outbound',
          status: 'sent',
          appointmentId: appointments[1].id,
        },
      }),
      db.emailRecord.create({
        data: {
          from: 'ewatson@email.com',
          to: 'info@sunshinedental.com',
          subject: 'Need to reschedule crown fitting',
          body: 'Hello, I need to reschedule my crown fitting appointment. Something came up at work. Can we move it to the following week? Thanks, Emily',
          direction: 'inbound',
          status: 'received',
          appointmentId: appointments[4].id,
        },
      }),
      db.emailRecord.create({
        data: {
          from: 'info@sunshinedental.com',
          to: 'sarah.t@email.com',
          subject: 'Before Your Whitening Appointment',
          body: 'Hi Sarah, here are some tips for your upcoming whitening session: 1) Avoid coffee and dark beverages 24 hours before. 2) Brush thoroughly before arriving. 3) Results typically last 6-12 months. See you tomorrow at 9 AM!',
          direction: 'outbound',
          status: 'sent',
          appointmentId: appointments[2].id,
        },
      }),
      db.emailRecord.create({
        data: {
          from: 'rgarcia@email.com',
          to: 'info@sunshinedental.com',
          subject: 'Wisdom tooth extraction - insurance verification',
          body: 'Hello, I just booked a wisdom tooth extraction. Could you verify my MetLife dental insurance coverage before my appointment? My member ID is ML987654321. Thanks!',
          direction: 'inbound',
          status: 'received',
          appointmentId: appointments[7].id,
        },
      }),
    ])

    // --- Call Logs ---
    const callLogs = await Promise.all([
      db.callLog.create({
        data: {
          customerName: 'Maria Rodriguez',
          customerPhone: '(619) 555-0234',
          direction: 'inbound',
          duration: 245,
          status: 'completed',
          notes: 'Called to book cleaning appointment. Confirmed for tomorrow 10 AM. Reminded to bring insurance card.',
        },
      }),
      db.callLog.create({
        data: {
          customerPhone: '(619) 555-0899',
          direction: 'inbound',
          duration: 0,
          status: 'missed',
          notes: 'Missed call, no voicemail left.',
        },
      }),
      db.callLog.create({
        data: {
          customerName: 'David Kim',
          customerPhone: '(760) 555-0321',
          direction: 'inbound',
          duration: 180,
          status: 'completed',
          notes: 'Follow-up call after emergency visit. Pain has subsided with antibiotics. Scheduled follow-up cleaning in 2 weeks.',
        },
      }),
      db.callLog.create({
        data: {
          customerName: 'Lisa Patel',
          customerPhone: '(858) 555-0147',
          direction: 'outbound',
          duration: 320,
          status: 'completed',
          notes: 'Called to schedule Invisalign consultation. Patient interested in clear aligners. Booked for next Friday 10:30 AM. Discussed pricing and insurance options.',
        },
      }),
      db.callLog.create({
        data: {
          customerName: 'Michael Brown',
          customerPhone: '(619) 555-0987',
          direction: 'outbound',
          duration: 45,
          status: 'voicemail',
          notes: 'Called to follow up on no-show. Left voicemail offering to reschedule. Mentioned $50 no-show policy will be waived for first occurrence.',
        },
      }),
    ])

    // --- Integrations ---
    const integrations = await Promise.all([
      db.integration.create({
        data: {
          type: 'google_calendar',
          name: 'Google Calendar',
          status: 'connected',
          config: JSON.stringify({
            calendarId: 'sunshinedental@gmail.com',
            syncInterval: 15,
            twoWaySync: true,
          }),
          lastSyncAt: new Date(),
        },
      }),
      db.integration.create({
        data: {
          type: 'sendgrid',
          name: 'SendGrid',
          status: 'disconnected',
          config: JSON.stringify({
            apiKey: '',
            fromEmail: 'info@sunshinedental.com',
            templateIds: {},
          }),
          lastSyncAt: null,
        },
      }),
      db.integration.create({
        data: {
          type: 'twilio',
          name: 'Twilio',
          status: 'disconnected',
          config: JSON.stringify({
            phoneNumber: '',
            accountSid: '',
            messagingServiceSid: '',
          }),
          lastSyncAt: null,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      counts: {
        business: 1,
        knowledgeDocs: knowledgeDocs.length,
        appointments: appointments.length,
        emailRecords: emailRecords.length,
        callLogs: callLogs.length,
        integrations: integrations.length,
        chatMessages: 0,
      },
    })
  } catch (error) {
    console.error('Failed to seed database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}