# HYDRAGENT

**Embeddable AI Appointment Agent for Any Business**

HYDRAGENT is a full-stack admin dashboard and embeddable chat widget that lets appointment-based businesses — restaurants, doctors, dentists, car mechanics, salons, spas, gyms, legal offices, and more — deploy an AI-powered agent on their website. The agent answers customer questions, books appointments, sends emails, and handles phone calls using a knowledge base you upload.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Production Deployment](#production-deployment)
  - [Option A: Docker (Recommended)](#option-a-docker-recommended)
  - [Option B: Bare Metal / VPS](#option-b-bare-metal--vps)
  - [Option C: Platform (Vercel / Railway)](#option-c-platform-vercel--railway)
- [Remote Client Setup](#remote-client-setup)
  - [Step 1: Prepare the Machine](#step-1-prepare-the-machine)
  - [Step 2: Transfer the Project](#step-2-transfer-the-project)
  - [Step 3: Install & Build](#step-3-install--build)
  - [Step 4: Configure the Business](#step-4-configure-the-business)
  - [Step 5: Start the Service](#step-5-start-the-service)
  - [Step 6: Embed the Widget](#step-6-embed-the-widget)
  - [One-Script Setup (Alternative)](#one-script-setup-alternative)
- [Configuring for a New Client](#configuring-for-a-new-client)
- [Embedding the Widget on a Client Site](#embedding-the-widget-on-a-client-site)
- [API Reference](#api-reference)
- [Integrations](#integrations)
  - [Integration Readiness Overview](#integration-readiness-overview)
  - [Twilio Integration Guide](#twilio-integration-guide)
  - [SendGrid Integration Guide](#sendgrid-integration-guide)
- [Maintenance & Data Management](#maintenance--data-management)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### Admin Dashboard (10 Sections)

| Section | Description |
|---------|-------------|
| **Dashboard** | Overview stats — appointments, emails, calls, recent activity feed, upcoming bookings |
| **Analytics** | 14-day booking trends, status breakdowns, top services, peak hours, day-of-week heatmaps, channel usage, system health |
| **Knowledge Base** | Upload documents (text, markdown, files) or paste content directly. Toggle documents active/inactive to control what the agent knows |
| **Appointments** | Full CRUD — create, confirm, complete, cancel. Filter by status. Duration tracking |
| **Emails** | Inbox/sent/drafts tabs, compose emails, read full threads |
| **Calls** | Log inbound/outbound calls, track duration, status (completed/missed/voicemail), quick stats |
| **Integrations** | Connect Google Calendar, Outlook, SendGrid, Twilio, Calendly, Zapier |
| **Embed Widget** | Live widget preview, customize colors/position/greeting, copy embed code |
| **Agent Preview** | Test the AI agent in a split chat interface with live knowledge context panel |
| **Admin & Settings** | Business profile editing, agent behavior config, database maintenance, data export, system info, danger zone |

### AI Agent

- Powered by LLM via `z-ai-web-dev-sdk`
- Uses all active knowledge documents as context
- Remembers conversation history (last 20 messages)
- Configurable tone (Professional / Friendly / Casual / Formal)
- Configurable response length (Short / Medium / Detailed)
- Optional auto-confirmation of appointments
- Optional customer info collection

### Multi-Tenant Ready

The admin panel is designed so you can reconfigure the entire business identity from **Settings** — change the name, type, phone, email, address, hours, description, and agent personality. The upload limit is set to **900 KB** per request.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Standalone output) |
| Language | TypeScript 5 |
| Runtime | Bun |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (New York style) |
| Icons | Lucide React |
| Animations | Framer Motion |
| Database | SQLite via Prisma ORM 6 |
| State Management | Zustand (client) |
| Server State | TanStack Query |
| AI | z-ai-web-dev-sdk |
| Reverse Proxy | Caddy |

---

## Project Structure

```
HYDRAGENT/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Main SPA entry (all views)
│   │   ├── globals.css             # Tailwind + theme variables
│   │   └── api/
│   │       ├── analytics/route.ts  # Analytics aggregation endpoint
│   │       ├── business/route.ts   # Business profile GET/PUT
│   │       ├── appointments/       # Appointment CRUD
│   │       ├── calls/              # Call log CRUD
│   │       ├── chat/route.ts       # AI chat (LLM-powered)
│   │       ├── emails/             # Email CRUD
│   │       ├── integrations/       # Integration management
│   │       ├── knowledge/          # Knowledge doc CRUD + file upload
│   │       └── seed/route.ts       # Database seeder
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   ├── Header.tsx          # Top header bar
│   │   │   ├── DashboardView.tsx   # Overview stats
│   │   │   ├── analytics/          # Analytics charts
│   │   │   ├── appointments/       # Appointment management
│   │   │   ├── calls/              # Call management
│   │   │   ├── chat/               # Agent preview
│   │   │   ├── emails/             # Email management
│   │   │   ├── embed/              # Widget configuration
│   │   │   ├── integrations/       # Integration cards
│   │   │   ├── knowledge/          # Knowledge base
│   │   │   └── settings/           # Admin & settings
│   │   └── ui/                     # shadcn/ui components
│   └── lib/
│       ├── db.ts                   # Prisma client singleton
│       ├── store.ts                # Zustand navigation state
│       └── utils.ts                # Utility functions
├── prisma/
│   └── schema.prisma               # Database schema (7 models)
├── db/
│   └── custom.db                   # SQLite database file
├── public/                         # Static assets
├── mini-services/                  # Optional microservices
├── Caddyfile                       # Reverse proxy config
├── next.config.ts                  # Next.js config (900KB upload limit)
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## Prerequisites

- **Bun** 1.0+ ([install](https://bun.sh))
- **Node.js** 18+ (if not using Bun)
- **Git**
- **Caddy** (for production reverse proxy — [install](https://caddyserver.com/install))

---

## Local Development

```bash
# 1. Clone the repository
git clone https://github.com/LIFEJACKETAI/HYDRAGENT.git
cd HYDRAGENT

# 2. Install dependencies
bun install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section below)

# 4. Initialize the database
bun run db:push

# 5. (Optional) Seed with sample data
# Start the dev server first, then:
curl -X POST http://localhost:3000/api/seed

# 6. Start the development server
bun run dev
```

The app will be available at **http://localhost:3000**.

---

## Environment Variables

A full `.env.example` file is included in the repo. Copy it and fill in your values:

```bash
cp .env.example .env
nano .env
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database file path | `file:./db/custom.db` |
| `PORT` | Internal server port | `3000` |
| `HOSTNAME` | Bind address | `0.0.0.0` |
| `NODE_ENV` | Set to `production` for deployed instances | `production` |

### AI Chat (z-ai-web-dev-sdk)

The AI chat uses `z-ai-web-dev-sdk` which auto-configures in this environment. **No API key is needed** for the built-in setup. If you deploy outside this environment, you may need to set `ZAI_API_KEY`.

### Integration Variables (Optional — only add what you need)

#### Twilio — Phone Calls & SMS

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `TWILIO_ACCOUNT_SID` | Your Twilio account ID (starts with `AC...`) | [Twilio Console → Dashboard](https://www.twilio.com/console) |
| `TWILIO_AUTH_TOKEN` | Your Twilio auth token | Twilio Console → Dashboard |
| `TWILIO_PHONE_NUMBER` | A purchased Twilio number (E.164 format) | Twilio Console → Phone Numbers |
| `TWILIO_WEBHOOK_BASE` | Your public URL for Twilio callbacks | Set to your domain, e.g. `https://your-domain.com` |

**Quick Twilio Setup:**
1. Sign up at [twilio.com](https://www.twilio.com/try-twilio)
2. Get your Account SID and Auth Token from the Console dashboard
3. Buy a phone number in Phone Numbers → Buy a Number
4. Add the three variables above to your `.env`
5. In the HYDRAGENT admin, go to **Integrations** → click **Connect** on Twilio
6. For **incoming calls**, configure Twilio's voice webhook to point to:
   `https://your-domain.com/api/twilio/voice`
7. For **incoming SMS**, configure the SMS webhook to:
   `https://your-domain.com/api/twilio/sms`

> **Note:** The Twilio integration UI in HYDRAGENT is ready. The webhook endpoint routes (`/api/twilio/voice`, `/api/twilio/sms`) need to be implemented to handle actual call/SMS routing — see [Twilio Integration Guide](#twilio-integration-guide) below.

#### SendGrid — Email Sending

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `SENDGRID_API_KEY` | Your SendGrid API key (starts with `SG...`) | [SendGrid → Settings → API Keys](https://app.sendgrid.com/settings/api_keys) |
| `SENDGRID_FROM_EMAIL` | Verified sender email | SendGrid → Settings → Sender Authentication |
| `SENDGRID_FROM_NAME` | Display name for outgoing emails | Any value |
| `SENDGRID_REPLY_TO` | Reply-to address | Optional |

**Quick SendGrid Setup:**
1. Create a free account at [sendgrid.com](https://sendgrid.com)
2. Verify a sender domain or single sender email
3. Create an API Key with "Mail Send" permissions
4. Add `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` to your `.env`
5. In the HYDRAGENT admin, go to **Integrations** → click **Connect** on SendGrid

#### Google Calendar

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID | [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret | Same as above |

**Quick Google Calendar Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or select existing)
3. Enable the Google Calendar API in APIs & Services → Library
4. Go to APIs & Services → Credentials → Create OAuth 2.0 Client ID
5. Set authorized redirect URI to: `https://your-domain.com/api/auth/google/callback`
6. Copy Client ID and Secret into your `.env`

#### Microsoft Outlook Calendar

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `MICROSOFT_CLIENT_ID` | Azure App Registration ID | [Azure Portal → App registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade) |
| `MICROSOFT_CLIENT_SECRET` | Azure App Secret | Same as above |
| `MICROSOFT_TENANT_ID` | Azure tenant ID | Azure Portal → Overview |

#### Calendly — Self-Booking

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `CALENDLY_API_KEY` | Personal Access Token | [Calendly → Integrations & Apps → API & Webhooks](https://calendly.com/integrations/api_webhooks) |

#### Zapier — Webhooks

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `ZAPIER_WEBHOOK_URL` | Zapier catch webhook URL | Create a Zap → Trigger: "Webhooks by Zapier" → Catch Hook |

#### Email Receiving (IMAP) — Optional

| Variable | Description | Example |
|----------|-------------|---------|
| `IMAP_SERVER` | IMAP server hostname | `imap.gmail.com` |
| `IMAP_PORT` | IMAP port (usually 993 for SSL) | `993` |
| `IMAP_USER` | Email address to check | `bookings@yourbusiness.com` |
| `IMAP_PASSWORD` | App password (not your real password) | Google: use App Passwords |
| `IMAP_TLS` | Enable TLS | `true` |

> **Gmail users:** You must use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password. Enable 2FA first, then generate an app password under your Google Account → Security.

---

## Database Setup

HYDRAGENT uses **SQLite** via Prisma ORM. The database file lives at `db/custom.db`.

### Schema Overview (7 Models)

| Model | Purpose |
|-------|---------|
| `Business` | Business name, type, contact info, widget customization |
| `KnowledgeDoc` | Uploaded knowledge documents (text content, file type, active toggle) |
| `Appointment` | Customer bookings with status workflow |
| `EmailRecord` | Inbound and outbound emails |
| `CallLog` | Phone call records with duration and status |
| `Integration` | Third-party service connections (Google Calendar, Twilio, etc.) |
| `ChatMessage` | Agent chat history |

### Commands

```bash
# Push schema changes to the database (creates tables)
bun run db:push

# Generate the Prisma client
bun run db:generate

# Reset the database completely
bun run db:reset
```

---

## Production Deployment

### Option A: Docker (Recommended)

Create a `Dockerfile` in the project root:

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production image
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/db ./db
COPY --from=builder /app/Caddyfile ./Caddyfile

EXPOSE 3000 81

CMD ["sh", "-c", "caddy run --config Caddyfile --adapter caddyfile & bun .next/standalone/server.js"]
```

Build and run:

```bash
docker build -t hydragent .
docker run -d -p 81:81 -p 3000:3000 \
  -v hydragent-data:/app/db \
  --name hydragent \
  hydragent
```

### Option B: Bare Metal / VPS

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Bun
curl -fsSL https://bun.sh/install | bash

# 3. Clone the repo
git clone https://github.com/LIFEJACKETAI/HYDRAGENT.git
cd HYDRAGENT

# 4. Install dependencies
bun install

# 5. Set up environment
cp .env.example .env
nano .env  # Edit with your values

# 6. Initialize database
bun run db:push

# 7. Build for production
bun run build

# 8. Start with Caddy (reverse proxy on port 81)
caddy run --config Caddyfile --adapter caddyfile &
NODE_ENV=production bun .next/standalone/server.js
```

To run as a systemd service for auto-restart:

```bash
sudo tee /etc/systemd/system/hydragent.service << 'EOF'
[Unit]
Description=HYDRAGENT AI Agent
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/hydragent
Environment=NODE_ENV=production
Environment=DATABASE_URL=file:/var/www/hydragent/db/custom.db
ExecStart=/root/.bun/bin/bun .next/standalone/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable hydragent
sudo systemctl start hydragent
```

### Option C: Platform (Vercel / Railway)

> **Note:** The standalone output mode and SQLite database make HYDRAGENT best suited for Docker or VPS deployment. For serverless platforms, you would need to swap SQLite for a managed database (PostgreSQL/MySQL) by changing the Prisma datasource in `prisma/schema.prisma`.

For **Railway** (supports Docker):

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and create project
railway login
railway init

# Deploy
railway up
```

---

## Remote Client Setup

This section covers how to deploy HYDRAGENT on a **client's machine** remotely — for example, setting up a dentist's office server from your own machine.

### Step 1: Prepare the Machine

The client's machine needs:
- **OS:** Ubuntu 22.04+ / Debian 12+ / CentOS 8+ (or any Linux with Bun support)
- **Minimum specs:** 1 CPU core, 1 GB RAM, 10 GB disk
- **Recommended:** 2 CPU cores, 2 GB RAM, 20 GB disk
- **Ports:** 80 (HTTP) and 443 (HTTPS) open, or any port you configure

### Step 2: Transfer the Project

**Option A: Git (recommended if the client has internet)**

```bash
# From YOUR machine — SSH into the client's server
ssh user@client-server-ip

# On the client's server:
git clone https://github.com/LIFEJACKETAI/HYDRAGENT.git /opt/hydragent
cd /opt/hydragent
```

**Option B: SCP (copy files directly from your machine)**

```bash
# From YOUR machine — copy the project directory
scp -r ./HYDRAGENT user@client-server-ip:/opt/hydragent

# Then SSH in
ssh user@client-server-ip
cd /opt/hydragent
```

**Option C: rsync (faster for large projects, supports resume)**

```bash
# From YOUR machine
rsync -avz --progress ./HYDRAGENT/ user@client-server-ip:/opt/hydragent/
```

### Step 3: Install & Build

SSH into the client's machine and run:

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Navigate to the project
cd /opt/hydragent

# Install dependencies
bun install

# Create the environment file
cat > .env << 'ENVEOF'
DATABASE_URL="file:/opt/hydragent/db/custom.db"
PORT=3000
HOSTNAME=0.0.0.0
ENVEOF

# Create the database directory
mkdir -p db

# Push the database schema
bun run db:push

# Build for production
bun run build
```

### Step 4: Configure the Business

Before starting, configure the business details. You have two options:

**Option A: Use the Admin Panel (GUI — recommended)**

1. Start the dev server temporarily:
   ```bash
   bun run dev &
   ```
2. Open `http://client-server-ip:3000` in your browser
3. Navigate to **Admin & Settings** in the sidebar
4. Fill in the business name, type, phone, email, address, hours, and description
5. Upload knowledge documents in the **Knowledge Base** section
6. Stop the dev server: `kill %1`

**Option B: Use the Seed API (quick demo data)**

```bash
# Start the server, then seed sample data
bun run dev &
sleep 5
curl -X POST http://localhost:3000/api/seed
```

**Option C: Use the Business API (programmatic)**

```bash
# Start the server first, then:
curl -X PUT http://localhost:3000/api/business \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Joes Auto Repair",
    "type": "Car Mechanic",
    "description": "Full-service auto repair and maintenance shop",
    "phone": "(555) 123-4567",
    "email": "info@joesauto.com",
    "address": "456 Main St, Austin, TX 78701",
    "website": "https://joesauto.com",
    "hours": "Mon-Fri 8am-6pm, Sat 9am-3pm, Sun Closed",
    "primaryColor": "#0d9488",
    "accentColor": "#f59e0b",
    "widgetPosition": "bottom-right",
    "widgetGreeting": "Hi! Need to book a service? Ask me anything!"
  }'

# Add knowledge documents
curl -X POST http://localhost:3000/api/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Services and Pricing",
    "content": "Oil Change: $49.99\nBrake Inspection: Free\nBrake Pad Replacement: $199.99\nTransmission Flush: $149.99\nEngine Diagnostic: $89.99\nTire Rotation: $39.99\nAC Recharge: $129.99",
    "fileType": "text",
    "source": "paste"
  }'
```

### Step 5: Start the Service

**For development/testing:**

```bash
cd /opt/hydragent
bun run dev
```

**For production (with Caddy reverse proxy):**

```bash
cd /opt/hydragent

# Install Caddy if not present
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy

# Start both Caddy and the app
nohup caddy run --config Caddyfile --adapter caddyfile > /var/log/caddy.log 2>&1 &
NODE_ENV=production nohup bun .next/standalone/server.js > /var/log/hydragent.log 2>&1 &
```

**As a systemd service (auto-restarts on crash/reboot):**

```bash
sudo tee /etc/systemd/system/hydragent.service << 'EOF'
[Unit]
Description=HYDRAGENT AI Appointment Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/hydragent
Environment=NODE_ENV=production
Environment=DATABASE_URL=file:/opt/hydragent/db/custom.db
ExecStart=/root/.bun/bin/bun /opt/hydragent/.next/standalone/server.js
Restart=always
RestartSec=5
StandardOutput=append:/var/log/hydragent.log
StandardError=append:/var/log/hydragent.log

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable hydragent
sudo systemctl start hydragent

# Check status
sudo systemctl status hydragent

# View logs
journalctl -u hydragent -f
```

### Step 6: Embed the Widget

1. Log into the HYDRAGENT admin panel at `http://client-server-ip:81`
2. Go to **Embed Widget** in the sidebar
3. Customize the widget appearance (colors, position, greeting)
4. Click **Copy Code**
5. Give the embed snippet to the client to add to their website:

```html
<script src="https://cdn.hydragent.ai/widget.js" data-id="BUSINESS_ID_HERE"></script>
```

### One-Script Setup (Alternative)

Save this as `setup-client.sh` and run it on the client's server:

```bash
#!/bin/bash
set -e

# ═══ Configuration ═════════════════════════════════════════
BUSINESS_NAME="${1:-My Business}"
BUSINESS_TYPE="${2:-Other}"
INSTALL_DIR="/opt/hydragent"
# ═════════════════════════════════════════════════════════

echo ">>> Installing Bun..."
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

echo ">>> Cloning HYDRAGENT..."
git clone https://github.com/LIFEJACKETAI/HYDRAGENT.git "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo ">>> Installing dependencies..."
bun install

echo ">>> Setting up database..."
mkdir -p db
cat > .env << EOF
DATABASE_URL="file:$INSTALL_DIR/db/custom.db"
PORT=3000
HOSTNAME=0.0.0.0
EOF

bun run db:push

echo ">>> Building for production..."
bun run build

echo ">>> Seeding sample data..."
NODE_ENV=development bun .next/standalone/server.js &
SERVER_PID=$!
sleep 5
curl -s -X POST http://localhost:3000/api/seed > /dev/null
kill $SERVER_PID 2>/dev/null || true

echo ">>> Configuring business: $BUSINESS_NAME ($BUSINESS_TYPE)..."
NODE_ENV=development bun .next/standalone/server.js &
SERVER_PID=$!
sleep 5
curl -s -X PUT http://localhost:3000/api/business \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$BUSINESS_NAME\",
    \"type\": \"$BUSINESS_TYPE\",
    \"widgetGreeting\": \"Hi! Welcome to $BUSINESS_NAME. How can I help you?\"
  }" > /dev/null
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "=========================================="
echo "  HYDRAGENT setup complete!"
echo "=========================================="
echo "  Install dir: $INSTALL_DIR"
echo "  Database:    $INSTALL_DIR/db/custom.db"
echo ""
echo "  To start:"
echo "    cd $INSTALL_DIR"
echo "    NODE_ENV=production bun .next/standalone/server.js"
echo ""
echo "  Or with Caddy (port 81):"
echo "    caddy run --config Caddyfile &"
echo "    NODE_ENV=production bun .next/standalone/server.js &"
echo "=========================================="
```

Usage:

```bash
# Upload the script to the client's server, then:
chmod +x setup-client.sh
./setup-client.sh "Sunshine Dental Clinic" "Dentist"
```

---

## Configuring for a New Client

When onboarding a new client, follow this checklist:

1. **Set up the server** (see [Remote Client Setup](#remote-client-setup))
2. **Log into the admin panel** → go to **Admin & Settings**
3. **Business Profile:**
   - Business Name (e.g. "La Piazza Restaurant")
   - Business Type (e.g. "Restaurant")
   - Phone, email, website, address
   - Business hours (the agent uses this to answer availability questions)
   - Description (services offered, specializations)
4. **Knowledge Base** → upload the client's:
   - Service menu / price list
   - FAQ document
   - Policies (cancellation, booking rules)
   - Aftercare instructions (for medical/dental)
   - Any other relevant info
5. **Agent Behavior** → customize:
   - Agent name (e.g. "La Piazza Assistant")
   - Welcome message
   - Response tone
6. **Embed Widget** → customize colors to match the client's brand, copy the embed code
7. **Give the client the embed code** to add to their website

---

## Embedding the Widget on a Client Site

The admin panel generates an embed code snippet. The client adds a single `<script>` tag to their website:

```html
<!-- Add this just before </body> on the client's website -->
<script src="https://cdn.hydragent.ai/widget.js" data-id="BUSINESS_ID"></script>
```

The widget supports:
- **Position:** Bottom-right or bottom-left
- **Custom colors:** Primary and accent colors to match the client's brand
- **Custom greeting:** Personalized welcome message
- **Auto-open:** Configurable delay (5s, 10s, 30s, or never)
- **Visitor info collection:** Optional name and email prompt

---

## API Reference

All API routes are prefixed with `/api/`. The server runs on port 3000 internally, with Caddy proxying port 81 externally.

### Business

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/business` | Get the business profile |
| PUT | `/api/business` | Create or update the business profile |

### Knowledge

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/knowledge` | List all knowledge documents |
| POST | `/api/knowledge` | Create document (JSON or multipart file upload, max 900 KB) |
| GET | `/api/knowledge/[id]` | Get a single document |
| PUT | `/api/knowledge/[id]` | Update a document |
| DELETE | `/api/knowledge/[id]` | Delete a document |
| DELETE | `/api/knowledge` | Delete all documents |

### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments?status=scheduled` | List appointments (optional status filter) |
| POST | `/api/appointments` | Create an appointment |
| PUT | `/api/appointments/[id]` | Update an appointment |
| DELETE | `/api/appointments/[id]` | Delete an appointment |
| DELETE | `/api/appointments` | Delete all appointments |

### Emails

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emails?direction=inbound` | List emails (optional direction filter) |
| POST | `/api/emails` | Create/send an email |
| DELETE | `/api/emails` | Delete all emails |

### Calls

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calls` | List all call logs |
| POST | `/api/calls` | Log a new call |
| DELETE | `/api/calls/[id]` | Delete a call log |
| DELETE | `/api/calls` | Delete all calls |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat` | Get chat history |
| POST | `/api/chat` | Send a message (returns AI response) |
| DELETE | `/api/chat` | Clear chat history |

### Integrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/integrations` | List all integrations |
| POST | `/api/integrations` | Create or update an integration |
| PUT | `/api/integrations/[id]` | Update integration status |
| DELETE | `/api/integrations/[id]` | Remove an integration |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get aggregated analytics data |

### Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/seed` | Reset database and seed with sample data |

---

## Integrations

HYDRAGENT supports connecting to third-party services from the **Integrations** page in the admin panel:

| Service | Purpose | Status |
|---------|---------|--------|
| Google Calendar | Two-way calendar sync | UI ready, OAuth flow needed for production |
| Outlook Calendar | Microsoft calendar sync | UI ready, OAuth flow needed for production |
| SendGrid | Transactional email sending | UI ready, API key config needed |
| Twilio | Phone calls (make/receive) & SMS | UI ready, webhook routes needed |
| Calendly | Customer self-booking | UI ready, OAuth flow needed for production |
| Zapier | Connect to 5000+ apps | UI ready, webhook URL config needed |

### Integration Readiness Overview

The admin panel's **Integrations** page lets you click "Connect" on any service. Currently the UI manages connection status and stores config in the database. To make a service fully functional in production:

1. Add the service's credentials to your `.env` file (see [Environment Variables](#environment-variables))
2. For OAuth services (Google, Outlook, Calendly): implement the OAuth callback route
3. For API-key services (SendGrid, Twilio): implement the API call logic in the relevant routes
4. For Twilio specifically, you need webhook endpoint routes — see below

### Twilio Integration Guide

Connecting Twilio gives HYDRAGENT the ability to make and receive real phone calls and send/receive SMS messages. Here's the full breakdown:

**What you need:**
- A [Twilio](https://www.twilio.com) account (free tier gives you a trial number)
- A Twilio phone number (purchased in the Twilio Console)
- A publicly accessible HTTPS URL (Caddy handles this with automatic Let's Encrypt SSL)

**Step-by-step phone system setup:**

1. **Add credentials to `.env`:**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   TWILIO_WEBHOOK_BASE=https://your-domain.com
   ```

2. **Implement webhook routes** — Create these API routes in `src/app/api/twilio/`:
   - `voice/route.ts` — Handles incoming calls. Returns TwiML to answer, greet the caller, and route to the AI agent or voicemail
   - `sms/route.ts` — Handles incoming SMS. Parses the message, sends it to the AI chat, and responds via SMS
   - `status/route.ts` — Receives call status callbacks (completed, no-answer, etc.) for logging

3. **Configure Twilio webhooks** in the Twilio Console:
   - Go to Phone Numbers → Active numbers → your number → Voice Configuration
   - Set "A call comes in" webhook to: `https://your-domain.com/api/twilio/voice`
   - Set "A message comes in" webhook to: `https://your-domain.com/api/twilio/sms`

4. **Example incoming call flow:**
   ```
   Customer calls Twilio number
     → Twilio POSTs to /api/twilio/voice
       → HYDRAGENT returns TwiML: <Say> greeting </Say> + <Gather> for speech/DTMF
         → Customer speaks or presses digits
           → Twilio POSTs to /api/twilio/voice?SpeechResult=...
             → HYDRAGENT sends to AI chat, returns TwiML response
   ```

5. **Testing with ngrok (during development):**
   ```bash
   # Expose your local server to the internet
   ngrok http 3000
   # Use the ngrok HTTPS URL as TWILIO_WEBHOOK_BASE
   ```

> **Current state:** The Integrations page UI is built and stores Twilio config in the database. The webhook API routes (`/api/twilio/*`) need to be created to complete the phone integration. The calls and SMS handling logic, TwiML generation, and call logging are the remaining pieces.

### SendGrid Integration Guide

1. Add `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` to `.env`
2. Implement email sending in the emails API route using `@sendgrid/mail`
3. Connect appointment confirmations, reminders, and customer notifications to SendGrid
4. For receiving emails, configure IMAP credentials in `.env` (see [Environment Variables](#environment-variables))

---

## Maintenance & Data Management

From the **Admin & Settings** page:

- **Export All Data** — Downloads a JSON backup of all business data (appointments, emails, calls, knowledge)
- **Clear by Type** — Selectively delete appointments, emails, calls, knowledge, or chat history
- **Reset All Data** — Re-seeds the database with sample data (useful for testing)
- **Delete Everything** — Wipes the entire database (use when onboarding a new client)

### Manual Database Backup

```bash
# Backup
cp db/custom.db db/custom-$(date +%Y%m%d-%H%M%S).db

# Restore
cp db/custom-20260708-120000.db db/custom.db
```

### Monitoring

```bash
# View application logs
tail -f /var/log/hydragent.log

# Check if the service is running
sudo systemctl status hydragent

# Check port usage
ss -tlnp | grep -E '3000|81'

# Health check
curl -s http://localhost:3000/api/business | head -c 100
```

---

## Troubleshooting

### White screen on load
- Ensure the database exists: `ls -la db/custom.db`
- Check the dev server log: `tail -20 dev.log`
- Verify dependencies are installed: `bun install`

### Upload fails for large files
- The upload limit is set to 900 KB in `next.config.ts` (`serverBodySizeLimit: 900000`)
- Increase it if needed, but be mindful of your server's memory

### Database errors
- Run `bun run db:push` to re-sync the schema
- If corrupted, delete `db/custom.db` and run `bun run db:push` again
- Seed fresh data: `curl -X POST http://localhost:3000/api/seed`

### Port already in use
- Kill the existing process: `lsof -ti:3000 | xargs kill -9`
- Or change the port in `.env`: `PORT=3001`

### AI chat not responding
- Ensure `z-ai-web-dev-sdk` is installed: `bun install`
- Check that knowledge documents are active in the Knowledge Base
- Check the server console for SDK errors

### Twilio calls not connecting
- Verify `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` are set in `.env`
- Ensure your server is publicly accessible (use `ngrok http 3000` during development)
- Check that webhook URLs in Twilio Console match your `TWILIO_WEBHOOK_BASE` + `/api/twilio/voice` and `/api/twilio/sms`
- Twilio trial accounts can only call verified numbers — verify your test phone number in Twilio Console
- Check Twilio's Debugger at https://www.twilio.com/console/debugger for error logs

### SendGrid emails not sending
- Verify the API key has "Mail Send" permissions
- Ensure the sender email is verified in SendGrid → Settings → Sender Authentication
- Check SendGrid's email activity at https://app.sendgrid.com/email_activity

---

## License

Private — All rights reserved. Contact LIFEJACKETAI for licensing inquiries.