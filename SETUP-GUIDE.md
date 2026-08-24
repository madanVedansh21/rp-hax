# ChargebackAI — End-to-End Setup & Integration Guide

> **Track 03: AI Revenue Recovery — Razorpay AI Buildathon**  
> Complete walkthrough on setting up Razorpay Test API Keys, Webhooks, Supabase DB, Claude AI, local tunneling, and testing live chargeback events.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Zero-Config Quickstart (Instant Demo)](#3-zero-config-quickstart-instant-demo)
4. [Step-by-Step Live Setup](#4-step-by-step-live-setup)
   - [Step 1: Get Razorpay Test API Keys](#step-1-get-razorpay-test-api-keys)
   - [Step 2: Generate Webhook Secret & Configure Razorpay Dashboard](#step-2-generate-webhook-secret--configure-razorpay-dashboard)
   - [Step 3: Expose Localhost with Ngrok (Webhook Tunneling)](#step-3-expose-localhost-with-ngrok-webhook-tunneling)
   - [Step 4: Get Anthropic Claude API Key](#step-4-get-anthropic-claude-api-key)
   - [Step 5: Setup Supabase Database (PostgreSQL)](#step-5-setup-supabase-database-postgresql)
   - [Step 6: Configure `.env.local`](#step-6-configure-envlocal)
5. [Starting the Application](#5-starting-the-application)
6. [How to Trigger & Test Chargebacks](#6-how-to-trigger--test-chargebacks)
   - [Method 1: Dashboard UI Simulation & Seeder](#method-1-dashboard-ui-simulation--seeder)
   - [Method 2: cURL / Postman Webhook Injection](#method-2-curl--postman-webhook-injection)
   - [Method 3: Razorpay CLI (Live Test Webhook)](#method-3-razorpay-cli-live-test-webhook)
7. [Troubleshooting & FAQs](#7-troubleshooting--faqs)

---

## 1. Architecture Overview

```
 [ Customer Dispute Raised ]
              │
              ▼
   Razorpay Gateway Fires
 payment.dispute.created Webhook
              │
              ▼
 [ POST /api/webhooks/razorpay ] ──▶ HMAC-SHA256 Verified via Razorpay SDK
              │
              ▼
  [ Autonomous AI Agent ]
  ├── 1. Gathers payment, order, card & refund records via Razorpay SDK / MCP
  ├── 2. Classifies dispute reason code (fraud, not_received, duplicate, etc.)
  ├── 3. Claude AI generates bank summary, merchant statement & evidence index
  ├── 4. AUTO_DRAFT: Automatically files draft to Razorpay contest API (buys deadline time)
  └── 5. Saves structured evidence package and audit logs to Supabase
              │
              ▼
 [ Merchant Review Dashboard ]
  ├── View gathered evidence & timeline
  ├── Edit AI draft representations
  ├── Download Bank-Ready PDF Evidence Package
  └── Click "Approve & Submit" (Calls rzp.disputes.contest with action:"submit")
```

---

## 2. Prerequisites

- **Node.js**: v18.x or v20+ / v22+
- **npm**: v9+ / v10+ / v11+
- **Razorpay Account**: Free signup at [dashboard.razorpay.com](https://dashboard.razorpay.com)
- **Anthropic Account**: (Optional for live Claude generation) at [console.anthropic.com](https://console.anthropic.com)
- **Supabase Account**: (Optional for cloud DB) at [supabase.com](https://supabase.com)
- **Ngrok**: (Optional for live webhooks from Razorpay) at [ngrok.com](https://ngrok.com)

---

## 3. Zero-Config Quickstart (Instant Demo)

ChargebackAI includes **smart deterministic fallback engines** for Razorpay SDK, Claude, and Supabase. You can run and evaluate the complete flow locally with zero external accounts or API keys required:

```bash
# 1. Clone or navigate to the repository
cd f:/rp-hax

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

- Click **"Seed 3 Demo Cases"** on the header to instantly load 3 realistic disputes (Fraud with 3DS OTP verification, Not Received with courier tracking, Duplicate charge).
- Click **"Simulate Webhook"** to trigger mock `payment.dispute.created` events and watch the agent pipeline execute live.

---

## 4. Step-by-Step Live Setup

Follow these steps to connect your live accounts and webhook listeners.

### Step 1: Get Razorpay Test API Keys

1. Log into your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Look at the top navigation bar or left sidebar and ensure **"Test Mode"** is active (toggle from Live to Test).
3. In the left sidebar, click **Account & Settings**.
4. Under **"Website and app settings"**, click **API Keys**.
5. Click **Generate Key** (or **Generate New Key**).
6. A modal will display your credentials:
   - **Key ID**: e.g., `rzp_test_1DP5mmOlF5G5ag`
   - **Key Secret**: e.g., `s82ZlV5Pxxxxxxxxx`
7. Copy both values immediately (the Key Secret will not be shown again).

---

### Step 2: Generate Webhook Secret & Configure Razorpay Dashboard

1. In the Razorpay Dashboard (in **Test Mode**), go to **Account & Settings** > **Webhooks** (under Website and app settings).
2. Click the **+ Add New Webhook** button.
3. Configure the fields:
   - **Webhook URL**: Your public HTTPS tunnel URL pointing to the webhook route:
     ```
     https://<your-subdomain>.ngrok-free.app/api/webhooks/razorpay
     ```
     *(See Step 3 to get your Ngrok URL).*
   - **Secret**: Enter a secure random string (e.g., `whsec_chargeback_secret_9981`). **Save this string** — you will put this in your `.env.local` as `RAZORPAY_WEBHOOK_SECRET`.
   - **Alert Email**: Enter your email address to receive notices if webhooks fail.
4. Under **Active Events**, search for and check:
   - ✅ **`payment.dispute.created`**
   - ✅ *(Optional)* `payment.dispute.won`
   - ✅ *(Optional)* `payment.dispute.lost`
5. Click **Create Webhook**.

---

### Step 3: Expose Localhost with Ngrok (Webhook Tunneling)

Razorpay needs a public HTTPS endpoint to deliver webhooks. Use `ngrok` (or Cloudflare Tunnel):

```bash
# In a separate terminal, expose port 3000
npx ngrok http 3000
```

Ngrok will print a forwarding address:
```
Forwarding   https://a1b2-c3d4.ngrok-free.app -> http://localhost:3000
```

Your webhook endpoint URL will be:
```
https://a1b2-c3d4.ngrok-free.app/api/webhooks/razorpay
```
*(Paste this exact URL into the Razorpay Webhooks dashboard).*

---

### Step 4: Get Anthropic Claude API Key

1. Go to [Anthropic Console](https://console.anthropic.com) and sign in.
2. Navigate to **API Keys** > **Create Key**.
3. Copy your key (starts with `sk-ant-api03-...`).

---

### Step 5: Setup Supabase Database (PostgreSQL)

1. Create a new project at [supabase.com](https://supabase.com).
2. Once created, go to the **SQL Editor** tab in Supabase dashboard.
3. Copy the entire contents of [`schema.sql`](file:///f:/rp-hax/schema.sql) from this project and paste it into the SQL Editor:
   ```sql
   -- Creates disputes, evidence_items, agent_logs, and response_drafts tables
   CREATE TABLE IF NOT EXISTS disputes (...);
   CREATE TABLE IF NOT EXISTS evidence_items (...);
   CREATE TABLE IF NOT EXISTS agent_logs (...);
   CREATE TABLE IF NOT EXISTS response_drafts (...);
   ```
4. Click **Run** to execute the schema.
5. Go to **Project Settings** > **API**:
   - Copy **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - Under **Project API keys**, copy the **`service_role`** secret key (`SUPABASE_SERVICE_ROLE_KEY`).

---

### Step 6: Configure `.env.local`

Create a file named `.env.local` in the root directory:

```bash
# Copy example template
cp .env.example .env.local
```

Fill in your `.env.local` credentials:

```env
# Razorpay API Credentials (Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Anthropic Claude API Key
ANTHROPIC_API_KEY=sk-ant-your_claude_key_here

# Supabase (PostgreSQL) configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key

# App Mode
NEXT_PUBLIC_APP_MODE=test
```

---

## 5. Starting the Application

```bash
# Run Next.js in development mode
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 6. How to Trigger & Test Chargebacks

### Method 1: Dashboard UI Simulation & Seeder
1. Open `http://localhost:3000`.
2. Click **"Simulate Webhook"** in the top right.
3. Select a reason code (e.g. `fraud`, `not_received`, `duplicate`), set an amount, and click **"Fire Webhook"**.
4. The dashboard will instantly show the new dispute in `pending` / `in_progress` state and complete the autonomous agent run in ~2-3 seconds.

---

### Method 2: cURL / Postman Webhook Injection
You can send a raw test webhook payload directly to your local API route:

```bash
curl -X POST http://localhost:3000/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: test_mode_simulation_signature" \
  -d '{
    "entity": "event",
    "account_id": "acc_merchant_test",
    "event": "payment.dispute.created",
    "contains": ["dispute"],
    "payload": {
      "dispute": {
        "entity": {
          "id": "disp_TEST_001",
          "payment_id": "pay_ABC123",
          "amount": 850000,
          "currency": "INR",
          "reason_code": "fraud",
          "status": "open",
          "respond_by": 1756080000,
          "created_at": 1755475200
        }
      }
    },
    "created_at": 1755475200
  }'
```

---

### Method 3: Razorpay CLI (Live Test Webhook)

If you have the official Razorpay CLI installed:

```bash
# 1. Login to Razorpay CLI
rzp login

# 2. Trigger payment.dispute.created webhook event
rzp trigger payment.dispute.created --url http://localhost:3000/api/webhooks/razorpay --secret your_webhook_secret_here
```

---

## 7. Troubleshooting & FAQs

### Q: "Invalid signature" webhook error?
- Ensure the string in `RAZORPAY_WEBHOOK_SECRET` in `.env.local` exactly matches the secret you entered when creating the webhook in Razorpay Dashboard.
- When simulating from Postman or local scripts in test mode, sending `"x-razorpay-signature: test_mode_simulation_signature"` will bypass HMAC check if secrets are in test mode.

### Q: What if I don't have an Anthropic API Key?
- The application automatically falls back to our deterministic, bank-formatted template generator. You will still receive complete summaries, statements, evidence indices, and strength ratings without errors.

### Q: What if Supabase is offline or not configured?
- The built-in in-memory fallback store (`mockStore`) automatically stores disputes, evidence items, drafts, and audit logs during your session.

### Q: How do I verify that the agent submitted the dispute contest?
- Navigate to `/dispute/[id]`.
- Inspect the **"Agent Execution Audit Trail"** at the bottom of the page.
- Look for `AUTO_DRAFT` (status: `SUCCESS`) and `SUBMIT_TO_RAZORPAY` log entries with execution timings.
