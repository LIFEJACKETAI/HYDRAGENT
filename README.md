# 🤖 HYDRAGENT: The Automated Revenue Engine

**Transform your business from "Taking Calls" to "Capturing Revenue"**

HYDRAGENT is a production-ready, AI-powered appointment ecosystem. It doesn't just answer questions—it actively manages your pipeline across Web, Voice, and SMS, ensuring no lead is ever lost and every booking is captured.

---

## 💎 Premium Features (The Revenue Engine)

### 1. Omnichannel Booking & Tool-Calling
HYDRAGENT uses **Intelligent Trigger Logic**. When the AI identifies a customer is ready to book, it doesn't just "say" it's booking—it programmatically writes a real `Appointment` record into your database in real-time.

### 2. 🚨 The "Panic Button" (Human Hand-off)
AI is powerful, but humans are essential. When HYDRAGENT detects frustration or a specific request for a "real person," it:
- **Notifies the Owner:** Sends an urgent emergency SMS to the business owner with the reason for hand-off.
- **Manages the User:** Gracefully informs the customer that a human team member is being connected.

### 3. 📈 Lead Recovery System
Don't let a "maybe" become a "never." HYDRAGENT tracks **Pending Leads**. If a customer starts a booking but drops off, the agent remembers this state. On the next interaction, it proactively follows up: *"I noticed we didn't finish your booking last time—would you like to complete that now?"*

### 4. Dynamic Knowledge Base
Zero hallucinations. The agent is grounded in your uploaded documents (PDFs, MD, TXT), ensuring pricing, services, and policies are delivered with 100% accuracy.

---

## 💰 SaaS Pricing Plans

| Feature | **Starter** | **Professional** | **Enterprise** |
|----------|--------------|-------------------|-------------------|
| **Target** | Solo-preneurs | Growing Businesses | Multi-Location / Agencies |
| **Price** | **$49/mo** | **$149/mo** | **Custom Quote** |
| **AI Agent** | Web Widget | Web + AI Voice + SMS | Full Omnichannel |
| **Bookings** | Up to 50/mo | Up to 300/mo | Unlimited |
| **Knowledge**| 5 Documents | Unlimited | Unlimited |
| **Recovery** | ❌ | ✅ Lead Recovery | ✅ Lead Recovery |
| **Handoff** | ❌ | ✅ Panic Button | ✅ Priority Handoff |
| **Support** | Email | Priority Email/Chat | Dedicated Manager |

**✨ White-Glove Setup:** For a one-time fee of **$199**, we handle all Twilio/SendGrid API configurations and knowledge base indexing for you.

---

## 🚀 Quick Start

### 1. Local Setup
```bash
git clone https://github.com/LIFEJACKETAI/HYDRAGENT.git
cd HYDRAGENT
bun install
cp .env.example .env # Set DATABASE_URL="file:./db/custom.db"
bun run db:push
bun run dev
```

### 2. Twilio Configuration (Voice & SMS)
Configure your Twilio Number webhooks to point to:
- **Voice:** `https://your-domain.com/api/twilio/voice`
- **SMS:** `https://your-domain.com/api/twilio/sms`
- **Status:** `https://your-domain.com/api/twilio/status`

---

## 🌐 Client Integration

### The Embeddable Widget
The Admin Dashboard generates a unique snippet. Your client simply adds it before the `</body>` tag:

```html
<script src="https://cdn.hydragent.ai/widget.js" data-id="BUSINESS_ID"></script>
```

### Onboarding Workflow
1. **Identity:** Set Business Profile & Hours in **Settings**.
2. **Knowledge:** Upload price lists and FAQs in **Knowledge Base**.
3. **Connect:** Link Twilio for 24/7 phone/SMS automation.
4. **Deploy:** Embed the widget on the client's site.

---

## 🛠️ Tech Stack
- **Frontend/Backend:** Next.js 16 (App Router)
- **Database:** SQLite via Prisma ORM
- **AI:** z-ai-web-dev-sdk
- **Communications:** Twilio API
- **Deployment:** Docker / VPS with Caddy Proxy
