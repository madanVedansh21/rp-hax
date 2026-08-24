<div align="center">

# ⚡ ChargebackAI
### Autonomous Dispute Defense & Revenue Recovery Agent for Razorpay Merchants

**Razorpay AI Buildathon — Track 03: AI Revenue Recovery**

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Razorpay SDK](https://img.shields.io/badge/Razorpay_SDK-Node.js-blue?style=flat-square&logo=razorpay)](https://razorpay.com/)
[![Claude 3.5 Sonnet](https://img.shields.io/badge/Anthropic_Claude-3.5_Sonnet-purple?style=flat-square)](https://www.anthropic.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<p align="center">
  <b>The moment a chargeback webhook arrives, ChargebackAI autonomously gathers evidence via the Razorpay SDK, classifies bank dispute reason codes, builds a bank-formatted response package, and auto-drafts the contest representation before deadlines expire.</b>
</p>

</div>

---

## 🛑 The Problem

When a customer disputes a payment with their issuing bank, Razorpay notifies the merchant with a chargeback notice. The merchant has **7–14 days** to respond with structured evidence, or the dispute is auto-lost and the money is permanently gone.

**The reality for most merchants:**
- ❌ Non-technical merchants panic and don't know what "admissible evidence" means in bank terms.
- ❌ Merchants scramble across Razorpay dashboards, courier run-sheets, OTP logs, and email threads.
- ❌ Buried notifications lead to missed bank deadlines.
- ❌ Merchants write weak, unstructured responses that bank dispute officers immediately reject.

> **Result:** Indian merchants lose an estimated **60–70%** of winnable chargebacks purely due to poor response quality and missed deadlines.

---

## 💡 The Solution: ChargebackAI

ChargebackAI is an autonomous AI dispute specialist that reacts within milliseconds to incoming `payment.dispute.created` webhooks:

1. **Instant Webhook Ingestion:** Ingests and verifies Razorpay dispute webhooks using `Razorpay.validateWebhookSignature()`.
2. **Multi-Source Evidence Gathering:** Uses the official Razorpay Node SDK to pull payment authorization records, order fulfillment data, card 3DS/2FA OTP authentication verification, prior refund history, and multi-attempt payment reconciliation.
3. **Dispute Reason Classification:** Maps specific bank reason codes (`fraud`, `not_received`, `duplicate`, `not_as_described`, `subscription_cancelled`) to evidence strategies.
4. **Bank-Grade AI Generation:** Uses Anthropic Claude to craft concise 200-word bank summaries, official first-person merchant statements, and structured evidence indices.
5. **Instant Auto-Drafting:** Immediately calls `rzp.disputes.contest(..., { action: "draft" })` to register the dispute draft with Razorpay, stopping the clock.
6. **Merchant Workbench & 1-Click Submission:** Provides a merchant review screen with editable response fields, proof-of-evidence breakdown, downloadable PDF packages, and 1-click submission calling `rzp.disputes.contest(..., { action: "submit" })`.
7. **Complete Execution Audit Log:** Every SDK call, timestamp, and duration is logged for full compliance and transparency.

---

## 🏛 Architecture & Workflow

```
   Chargeback Webhook Fired (payment.dispute.created)
                         │
                         ▼
        POST /api/webhooks/razorpay (HMAC Verified)
                         │
                         ▼
           Autonomous Background Agent
  ┌──────────────────────┼──────────────────────┐
  ▼                      ▼                      ▼
[ GATHER ]          [ CLASSIFY ]           [ BUILD ]
Razorpay SDK        Reason Code            Claude AI
• fetchPayment      • fraud                • Bank Summary
• fetchOrder        • not_received         • Merchant Statement
• fetchRefunds      • duplicate            • Evidence Index
• 3DS Auth logs     • not_as_described     • Strength Rating
  │                      │                      │
  └──────────────────────┼──────────────────────┘
                         ▼
             [ AUTO-DRAFT TO RAZORPAY ]
     rzp.disputes.contest(..., { action: "draft" })
                         │
                         ▼
           [ MERCHANT REVIEW WORKBENCH ]
  ├── Left: Gathered Evidence & Raw MCP/SDK JSON
  ├── Right: Editable Draft, Evidence Checklist & Gap Warnings
  ├── Bottom: Timed Execution Audit Log (e.g. 124ms, 89ms)
  └── Actions: Download Bank PDF • Approve & Submit to Razorpay
```

---

## 📊 Measurable Outcomes for Judges

| Metric | How It's Measured | Display Location |
| :--- | :--- | :--- |
| **Evidence Items Gathered** | Count of verified available sources (`fetchPayment`, `fetchOrder`, etc.) | Dashboard & Evidence Panel |
| **Agent Execution Speed** | Sum of microsecond `duration_ms` across SDK & AI calls (avg 2.5s) | Audit Log Panel |
| **Evidence Strength Rating** | `STRONG` (●●●●), `MODERATE` (●●○○), `WEAK` (●○○○) | Dispute Cards & PDF |
| **Evidence Gap Detection** | Identification of missing physical PODs, courier run-sheets, or receipts | Draft Panel Alerts |
| **Merchant Customization** | Tracking of `is_edited` flag and audit log updates | Audit Trail |

---

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Components & Serverless API Routes)
- **Payment & Gateway SDK**: Official `razorpay` Node.js SDK
- **AI & NLP Engine**: Anthropic Claude (`@anthropic-ai/sdk`) with deterministic fallback engine
- **Database**: Supabase (PostgreSQL) + In-Memory local fallback store (`mockStore`)
- **PDF Generation**: `jspdf` for formal bank dispute submission packages
- **Styling & UI**: Tailwind CSS, Lucide Icons, Dark/Light Fintech UI

---

## 🚀 Quickstart & Demo Modes

### 1. Instant Zero-Config Demo Mode (No API keys needed)
ChargebackAI is built with smart fallback engines so you can explore the full flow out-of-the-box:

```bash
# Clone the repository
git clone https://github.com/madanVedansh21/rp-hax.git
cd rp-hax

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser:
- Click **"Seed 3 Demo Cases"** to load test chargebacks (Fraud with 3DS OTP, Not Received with logistics tracking, Duplicate billing).
- Click **"Simulate Webhook"** to trigger custom live `payment.dispute.created` events.
- Open any dispute to review the evidence, edit the response, view the real-time audit log, and download the bank-ready PDF.

---

### 2. Live Integration Mode (With API Keys)

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```
2. Configure `.env.local`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxx
   RAZORPAY_KEY_SECRET=xxxxxx
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

   ANTHROPIC_API_KEY=sk-ant-xxxxxx

   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
3. Run the SQL schema in [`schema.sql`](schema.sql) in your Supabase SQL Editor.
4. Expose localhost with `npx ngrok http 3000` and register your webhook URL in Razorpay Dashboard (`/api/webhooks/razorpay`).

👉 For a complete, step-by-step tutorial on generating keys and registering webhooks, see [`SETUP-GUIDE.md`](SETUP-GUIDE.md).

---

## 📁 Repository Structure

```
rp-hax/
├── app/
│   ├── layout.tsx                    # Root layout with Header & fintech theme
│   ├── page.tsx                      # Dashboard: revenue at risk, active disputes, seeder
│   ├── dispute/[id]/page.tsx         # Dispute Review Workbench
│   └── api/
│       ├── webhooks/
│       │   └── razorpay/route.ts     # Ingest payment.dispute.created + SDK HMAC verify
│       ├── disputes/
│       │   ├── route.ts              # GET / POST disputes
│       │   └── [id]/
│       │       ├── route.ts          # GET / PATCH dispute & draft
│       │       └── submit/route.ts   # POST rzp.disputes.contest() submission
│       ├── agent/
│       │   └── run/route.ts          # POST trigger agent pipeline
│       └── demo/
│           └── seed/route.ts         # POST seed 3 test scenarios (Fraud, Not Received, Duplicate)
├── lib/
│   ├── types.ts                      # TypeScript types for disputes, evidence, drafts & logs
│   ├── supabase.ts                   # Supabase client + local fallback database store
│   ├── mcp.ts                        # Razorpay Node SDK client wrappers & contest methods
│   ├── classifier.ts                 # Reason code to evidence strategy mapper
│   ├── generator.ts                  # Claude prompt builder & bank package generator
│   ├── agent.ts                      # Autonomous agent orchestrator with safeCall & auto-draft
│   └── pdf-generator.ts              # Bank-ready Evidence Package PDF builder
├── components/
│   ├── Header.tsx                    # Navigation, agent live status & quick actions
│   ├── DisputeCard.tsx               # Dispute summary card with deadline & strength score
│   ├── EvidencePanel.tsx             # Structured SDK evidence viewer with raw JSON drawer
│   ├── DraftResponsePanel.tsx        # Editable summary, statement, checklist & submit action
│   ├── AgentLogViewer.tsx            # Step-by-step execution timeline with ms duration
│   ├── DeadlineBadge.tsx             # Urgency countdown badge (<2 days, 3-5 days, >5 days)
│   ├── StrengthIndicator.tsx         # STRONG / MODERATE / WEAK score indicator
│   └── SimulateWebhookModal.tsx      # Modal for firing test webhooks live
├── schema.sql                        # PostgreSQL / Supabase table definitions
├── SETUP-GUIDE.md                    # Complete setup and Razorpay webhook registration guide
├── prd-arch.md                       # Product Requirements & Architecture document
└── sdk-delta.md                      # Razorpay Node SDK delta specification
```

---

## 🏆 Razorpay Buildathon Demo Flow

1. **Webhook Ingestion (0:00 - 0:30):** Show `payment.dispute.created` webhook hitting the system → dispute immediately appears on dashboard with "Gathering MCP evidence..." status.
2. **Autonomous Agent Execution (0:30 - 1:30):** The agent fetches payment and 3DS verification, classifies the reason code, calls Claude to draft the response, and auto-drafts to Razorpay via `rzp.disputes.contest(action: "draft")`.
3. **Merchant Review & Customization (1:30 - 3:00):** Merchant inspects evidence cards on the left, reviews the bank summary and merchant statement on the right, makes optional edits (which flags `is_edited: true`), and clicks "Approve & Submit".
4. **Submission & PDF (3:00 - 4:30):** The contest representation is submitted to Razorpay via `action: "submit"`, audit log records the timestamp, and a bank-ready PDF package is downloaded.

---

## 📄 License

MIT License. Developed for the **Razorpay AI Buildathon — Track 03 (AI Revenue Recovery)**.
