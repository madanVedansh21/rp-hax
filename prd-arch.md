# ChargebackAI — Product Requirements & Architecture

### Razorpay AI Buildathon — Track 03: AI Revenue Recovery

---

## 1. Problem Statement

When a customer disputes a payment with their bank, Razorpay notifies the merchant with a chargeback. The merchant must respond with evidence within **7–14 days** or the dispute is auto-lost and the money is gone — permanently.

**The reality for most merchants:**

- They don't know what "evidence" means in this context
- They scramble through Razorpay dashboard, email threads, WhatsApp, shipping portals
- They miss deadlines because the notification got buried
- They write weak responses that banks reject

**Result:** Indian merchants lose an estimated 60–70% of chargebacks they could have won — purely due to poor response quality and missed deadlines. This is recoverable revenue.

**What this product does:** The moment a chargeback webhook fires, an AI agent wakes up, autonomously gathers all relevant evidence using the Razorpay MCP server, builds a structured dispute response package, and presents it to the merchant for one-click submission — before the deadline.

---

## 2. Scope for Buildathon (What You Actually Ship)

This is a 48-72 hour build. Be ruthless about scope.

### In Scope ✅

- Webhook ingestion from Razorpay (`payment.dispute.created`)
- Automated evidence gathering via Razorpay MCP (payment, order, customer, refund history)
- AI-generated dispute response document (PDF-ready)
- Merchant review dashboard — one screen, see dispute + evidence + draft response
- Approve / Edit / Submit flow
- Audit log of every agent action
- Test mode using Razorpay test API keys

### Out of Scope ❌ (post-hackathon)

- Direct API submission to banks (requires RBI approval)
- Multi-merchant SaaS
- Shipping carrier integrations (Delhivery, Shiprocket)
- Email/WhatsApp notification delivery
- Analytics across disputes

---

## 3. User

**Primary:** Small-to-mid Indian e-commerce merchant (D2C, Shopify store, services) using Razorpay as payment gateway. Non-technical. Panics when they see "dispute."

**Secondary (for demo):** Razorpay judges who want to see: real MCP usage, measurable outcome (dispute win rate), audit trail, graceful failure handling.

---

## 4. Core User Flow

```
Chargeback occurs
       ↓
Razorpay fires webhook → POST /api/webhooks/razorpay
       ↓
Agent wakes up (background job)
       ↓
[GATHER] Fetches payment, order, customer, refund history via MCP
       ↓
[ANALYZE] Classifies dispute reason code
       ↓
[BUILD] Generates evidence package + dispute response draft
       ↓
Merchant gets notified → opens dashboard
       ↓
Merchant reviews → [Approve / Edit] → Submit
       ↓
Evidence PDF generated → Ready to upload to Razorpay dispute portal
       ↓
Audit log stored
```

---

## 5. Agent Design (The Core)

### 5.1 Agent Trigger

```
Razorpay Webhook Event: payment.dispute.created
Payload contains:
  - dispute_id
  - payment_id
  - amount
  - reason_code (e.g. "chargeback", "fraud", "not_received")
  - respond_by (deadline timestamp)
```

### 5.2 Evidence Gathering — MCP Tool Calls

The agent makes these MCP calls sequentially:

| Step | MCP Tool                             | What It Gets                                             |
| ---- | ------------------------------------ | -------------------------------------------------------- |
| 1    | `fetch_payment`                      | Payment status, method, timestamp, bank, captured amount |
| 2    | `fetch_order`                        | Order ID, amount, receipt, notes                         |
| 3    | `fetch_payment_card_details`         | Card BIN, last 4, issuer (for fraud disputes)            |
| 4    | `fetch_multiple_refunds_for_payment` | Any prior refunds (shows good faith)                     |
| 5    | `fetch_order_payments`               | All payments tied to order (for multi-attempt cases)     |

Each tool call is logged with timestamp and result. If a call fails, it's marked as "unavailable" in the evidence file — never silently skipped.

### 5.3 Dispute Reason Classification

Razorpay dispute reason codes map to evidence strategy:

| Reason Code              | What Bank Is Claiming          | Evidence Strategy                                                 |
| ------------------------ | ------------------------------ | ----------------------------------------------------------------- |
| `fraud`                  | Card was stolen/misused        | Payment timestamp + device fingerprint + IP + successful 3DS auth |
| `not_received`           | Goods never delivered          | Order fulfilled status + delivery confirmation + customer comms   |
| `not_as_described`       | Product different from listing | Order description + payment notes + any customer communication    |
| `duplicate`              | Charged twice                  | Show single capture, refund trail if applicable                   |
| `subscription_cancelled` | Charged after cancellation     | Subscription timeline + cancellation date vs charge date          |
| `general`                | Bank-initiated dispute         | Maximum context dump                                              |

### 5.4 AI Response Generation

The agent sends gathered evidence to Claude with this structured prompt approach:

```
System: You are a payment dispute specialist generating evidence
packages for Razorpay merchants. Your output must be structured,
factual, and match the format expected by Indian issuing banks.
Never fabricate data. If a data point is unavailable, state it
explicitly. Be concise — bank dispute reviewers read 100s of cases.

Context: [Dispute reason code + merchant type]
Evidence: [All MCP data as structured JSON]

Generate:
1. One-paragraph dispute summary (for bank reviewer)
2. Ordered evidence list with each item labeled and explained
3. Merchant statement (first-person, for merchant to review/edit)
4. Strength assessment: STRONG / MODERATE / WEAK with reason
5. Missing evidence that would strengthen the case
```

### 5.5 Output Package

The agent produces:

- `dispute_summary.txt` — 200 word bank-facing summary
- `evidence_index.json` — structured list of all evidence with sources
- `merchant_statement.txt` — editable first-person statement
- `agent_log.json` — every action taken, timestamp, result, failure reason if any

---

## 6. Tech Architecture

### 6.1 Stack

```
Frontend:   Next.js 14 (App Router)
Backend:    Next.js API Routes (serverless)
Database:   Supabase (PostgreSQL)
AI:         Anthropic Claude API (claude-sonnet-4-6)
Payments:   Razorpay MCP Server (remote, via npx mcp-remote)
Queue:      Supabase Edge Functions or simple async job (hackathon: just async/await)
Auth:       None for hackathon (single merchant demo mode)
```

### 6.2 Database Schema (Supabase)

```sql
-- Disputes table
create table disputes (
  id uuid primary key default gen_random_uuid(),
  dispute_id text unique not null,       -- Razorpay dispute ID
  payment_id text not null,
  order_id text,
  amount integer not null,               -- in paise
  currency text default 'INR',
  reason_code text not null,
  respond_by timestamptz not null,       -- deadline
  status text default 'pending',         -- pending | in_progress | ready | submitted
  strength_score text,                   -- STRONG | MODERATE | WEAK
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Evidence table
create table evidence_items (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid references disputes(id),
  source text not null,                  -- mcp_tool name or 'ai_generated'
  label text not null,                   -- human readable label
  content jsonb not null,                -- raw data
  available boolean default true,        -- false if fetch failed
  created_at timestamptz default now()
);

-- Agent logs table
create table agent_logs (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid references disputes(id),
  action text not null,                  -- FETCH_PAYMENT, CLASSIFY, GENERATE, etc.
  status text not null,                  -- SUCCESS | FAILED | SKIPPED
  detail jsonb,
  duration_ms integer,
  created_at timestamptz default now()
);

-- Response drafts table
create table response_drafts (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid references disputes(id),
  summary text,
  merchant_statement text,
  evidence_index jsonb,
  missing_evidence text[],
  is_edited boolean default false,       -- did merchant modify the AI draft
  version integer default 1,
  created_at timestamptz default now()
);
```

### 6.3 File Structure

```
chargebackai/
├── app/
│   ├── page.tsx                    # Dashboard — list of disputes
│   ├── dispute/[id]/page.tsx       # Single dispute review screen
│   └── api/
│       ├── webhooks/
│       │   └── razorpay/route.ts   # Webhook ingestion + HMAC verify
│       ├── disputes/
│       │   ├── route.ts            # GET all disputes
│       │   └── [id]/route.ts       # GET single dispute
│       └── agent/
│           └── run/route.ts        # POST trigger agent for a dispute ID
├── lib/
│   ├── mcp.ts                      # MCP client wrapper
│   ├── agent.ts                    # Main agent orchestration
│   ├── classifier.ts               # Reason code → evidence strategy
│   ├── generator.ts                # Claude prompt builder + response parser
│   ├── razorpay-webhook.ts         # HMAC signature verification
│   └── supabase.ts                 # DB client
├── components/
│   ├── DisputeCard.tsx
│   ├── EvidencePanel.tsx
│   ├── AgentLog.tsx
│   ├── DeadlineBadge.tsx
│   └── StrengthIndicator.tsx
└── .env.local
    RAZORPAY_KEY_ID=
    RAZORPAY_KEY_SECRET=
    RAZORPAY_WEBHOOK_SECRET=
    ANTHROPIC_API_KEY=
    NEXT_PUBLIC_SUPABASE_URL=
    SUPABASE_SERVICE_ROLE_KEY=
```

### 6.4 Key Files — Core Logic

#### `lib/mcp.ts` — MCP Client

```typescript
// Using Razorpay MCP via subprocess (npx mcp-remote)
// For hackathon: wrap direct Razorpay REST API calls
// MCP remote server: https://mcp.razorpay.com/mcp

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function callRazorpayMCP(
  tool: string,
  params: Record<string, unknown>,
) {
  // Use Claude with MCP server attached
  const response = await client.beta.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    tools: [], // MCP tools injected via server config
    messages: [
      {
        role: "user",
        content: `Call ${tool} with params: ${JSON.stringify(params)}`,
      },
    ],
    // mcp_servers config added here
  });
  return response;
}

// Direct REST fallback for hackathon speed
export async function fetchPayment(paymentId: string) {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
      ).toString("base64")}`,
    },
  });
  return res.json();
}
```

#### `lib/agent.ts` — Agent Orchestration

```typescript
import { fetchPayment, fetchOrder, fetchRefunds } from "./mcp";
import { classifyDispute } from "./classifier";
import { generateResponse } from "./generator";
import { supabase } from "./supabase";

export async function runAgent(disputeId: string) {
  const log = makeLogger(disputeId); // writes to agent_logs table

  // 1. Load dispute from DB
  const { data: dispute } = await supabase
    .from("disputes")
    .select("*")
    .eq("dispute_id", disputeId)
    .single();

  await log("AGENT_START", "SUCCESS", { disputeId });

  // 2. Gather evidence
  const evidence: EvidenceItem[] = [];

  const payment = await safeCall(
    () => fetchPayment(dispute.payment_id),
    "FETCH_PAYMENT",
    log,
  );
  if (payment)
    evidence.push({
      source: "fetch_payment",
      label: "Payment Record",
      content: payment,
      available: true,
    });

  const order = dispute.order_id
    ? await safeCall(() => fetchOrder(dispute.order_id), "FETCH_ORDER", log)
    : null;
  if (order)
    evidence.push({
      source: "fetch_order",
      label: "Order Record",
      content: order,
      available: true,
    });

  const refunds = await safeCall(
    () => fetchRefunds(dispute.payment_id),
    "FETCH_REFUNDS",
    log,
  );
  if (refunds)
    evidence.push({
      source: "fetch_refunds",
      label: "Refund History",
      content: refunds,
      available: true,
    });

  // 3. Store evidence
  await supabase
    .from("evidence_items")
    .insert(evidence.map((e) => ({ dispute_id: dispute.id, ...e })));

  // 4. Classify + strategize
  const strategy = classifyDispute(dispute.reason_code, evidence);
  await log("CLASSIFY", "SUCCESS", { strategy });

  // 5. Generate AI response
  const draft = await generateResponse(dispute, evidence, strategy);
  await log("GENERATE", "SUCCESS", { strength: draft.strength_score });

  // 6. Store draft
  await supabase.from("response_drafts").insert({
    dispute_id: dispute.id,
    ...draft,
  });

  // 7. Mark ready
  await supabase
    .from("disputes")
    .update({ status: "ready", strength_score: draft.strength_score })
    .eq("id", dispute.id);

  await log("AGENT_COMPLETE", "SUCCESS", {});
}

// safeCall: never throws, always logs
async function safeCall(
  fn: () => Promise<unknown>,
  action: string,
  log: Logger,
) {
  try {
    const start = Date.now();
    const result = await fn();
    await log(action, "SUCCESS", {}, Date.now() - start);
    return result;
  } catch (err) {
    await log(action, "FAILED", { error: String(err) });
    return null;
  }
}
```

#### `app/api/webhooks/razorpay/route.ts` — Webhook Handler

```typescript
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { runAgent } from "@/lib/agent";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  // Verify HMAC-SHA256 signature
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.dispute.created") {
    const d = event.payload.dispute.entity;

    // Store dispute
    await supabase.from("disputes").insert({
      dispute_id: d.id,
      payment_id: d.payment_id,
      order_id: d.order_id ?? null,
      amount: d.amount,
      reason_code: d.reason_code,
      respond_by: new Date(d.respond_by * 1000).toISOString(),
      status: "pending",
    });

    // Fire agent async (don't await — return 200 to Razorpay immediately)
    runAgent(d.id).catch(console.error);
  }

  return NextResponse.json({ received: true });
}
```

---

## 7. Dashboard UI — Screen Breakdown

### Screen 1: Dispute List (`/`)

```
┌─────────────────────────────────────────────────────────┐
│  ChargebackAI                          [Test Mode Badge] │
├─────────────────────────────────────────────────────────┤
│  Active Disputes (3)          ₹24,500 at risk            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐ │
│  │ pay_ABC123  •  ₹8,500  •  fraud                    │ │
│  │ ●●●● STRONG evidence  •  Deadline: 3 days left     │ │
│  │ [Review & Submit →]                                 │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ pay_DEF456  •  ₹12,000  •  not_received            │ │
│  │ ●●○○ MODERATE evidence  •  Deadline: 1 day left ⚠️ │ │
│  │ [Review & Submit →]                                 │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ pay_GHI789  •  ₹4,000  •  duplicate                │ │
│  │ ⏳ Agent gathering evidence...                      │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Screen 2: Dispute Detail (`/dispute/[id]`)

```
┌─────────────────────────────────────────────────────────┐
│  ← Back    Dispute: pay_ABC123         3 days left  ⚠️  │
├──────────────────────┬──────────────────────────────────┤
│  EVIDENCE (left)     │  DRAFT RESPONSE (right)          │
│                      │                                  │
│  Payment Record ✅   │  Dispute Summary                 │
│  ₹8,500 • 14 Aug    │  [editable textarea]             │
│  UPI • Captured      │                                  │
│                      │  Merchant Statement              │
│  Order Record ✅     │  [editable textarea]             │
│  ORD_XYZ • Fulfilled │                                  │
│                      │  Evidence Index                  │
│  Refund History ✅   │  1. Payment captured ✅          │
│  No prior refunds    │  2. Order fulfilled ✅           │
│                      │  3. No prior refunds ✅          │
│  Card Details ✅     │                                  │
│  3DS Auth passed     │  Missing Evidence ⚠️            │
│                      │  • Delivery confirmation         │
│  Strength: STRONG    │  • Customer communication log    │
│  ●●●●                │                                  │
├──────────────────────┴──────────────────────────────────┤
│  Agent Log                                    [Collapse] │
│  14:32:01 FETCH_PAYMENT   SUCCESS   124ms               │
│  14:32:02 FETCH_ORDER     SUCCESS   89ms                │
│  14:32:03 FETCH_REFUNDS   SUCCESS   201ms               │
│  14:32:04 CLASSIFY        SUCCESS                       │
│  14:32:06 GENERATE        SUCCESS   strength=STRONG     │
├─────────────────────────────────────────────────────────┤
│  [Download Evidence PDF]        [Submit to Razorpay →]  │
└─────────────────────────────────────────────────────────┘
```

---

## 8. What "Measurable" Means for the Judges

The buildathon explicitly asks for metrics. Here's what you show:

| Metric                              | How to measure                               | Where to show   |
| ----------------------------------- | -------------------------------------------- | --------------- |
| Evidence items gathered per dispute | Count of `available: true` in evidence_items | Dashboard       |
| Agent run time                      | Sum of duration_ms in agent_logs             | Agent Log panel |
| Strength score                      | STRONG/MODERATE/WEAK from AI                 | Dispute card    |
| Missing evidence identified         | Length of missing_evidence array             | Draft panel     |
| Merchant edits made                 | `is_edited` flag in response_drafts          | Audit log       |

For the demo: run 3 test disputes — one STRONG, one MODERATE, one that fails gracefully with partial data. Show all three.

---

## 9. Build Order (Day-by-Day)

### Day 1 (Backend First)

- [ ] Supabase project + schema setup (30 min)
- [ ] Razorpay test account + webhook setup (30 min)
- [ ] `/api/webhooks/razorpay` — ingestion + HMAC verify (1 hr)
- [ ] `lib/mcp.ts` — Razorpay REST wrappers for 5 tools (1.5 hr)
- [ ] `lib/classifier.ts` — reason code → strategy map (30 min)
- [ ] `lib/agent.ts` — full orchestration with safeCall logging (2 hr)
- [ ] `lib/generator.ts` — Claude prompt + response parser (1.5 hr)
- [ ] Test end-to-end with Razorpay test dispute webhook (1 hr)

### Day 2 (Frontend + Polish)

- [ ] Dispute list page — fetch from Supabase, display cards (1.5 hr)
- [ ] Dispute detail page — evidence panel + draft panel (2 hr)
- [ ] Agent log component (45 min)
- [ ] Deadline badge + strength indicator (30 min)
- [ ] PDF download (use `jspdf` or just print-to-PDF from browser) (45 min)
- [ ] Demo data: 3 sample disputes with different reason codes (30 min)
- [ ] 5-minute pitch video recording (1 hr)

---

## 10. Environment Setup

```bash
# Create project
npx create-next-app@latest chargebackai --typescript --tailwind --app

# Install deps
npm install @anthropic-ai/sdk @supabase/supabase-js razorpay jspdf

# Env vars needed
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx           # from Razorpay dashboard > webhooks
ANTHROPIC_API_KEY=sk-ant-xxxx
NEXT_PUBLIC_SUPABASE_URL=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx

# Expose local webhook for testing
npx ngrok http 3000
# Then add https://xxxx.ngrok.io/api/webhooks/razorpay to Razorpay dashboard
```

---

## 11. Demo Script (5 Minutes)

```
0:00 — Problem (30 sec)
"Indian merchants lose chargebacks because they don't know what
evidence to submit and miss deadlines. We fix that."

0:30 — Live demo: dispute arrives (1 min)
Show webhook firing in terminal → dispute appears in dashboard
with "Agent gathering evidence..." state.

1:30 — Agent completes (1 min)
Dispute flips to STRONG, show agent log panel — each step timed.
Walk through evidence gathered from Razorpay MCP.

2:30 — Merchant reviews (1 min)
Open dispute detail. Show evidence panel left, draft right.
Edit merchant statement (show is_edited flag updates).

3:30 — Metrics (30 sec)
Show: 5 evidence items, 2 missing evidence identified,
run time 3.2 seconds, strength STRONG.

4:00 — Failure case (30 sec)
Show MODERATE dispute where fetch_order failed — agent logged it,
marked unavailable, still generated response with honest gap noted.

4:30 — Close (30 sec)
"This is the agent-to-resolution loop Razorpay's merchant base needs.
Every dispute handled in under 5 seconds. Audit trail. No missed deadlines."
```

---

## 12. What Could Go Wrong + Mitigations

| Risk                                   | Mitigation                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Razorpay MCP setup takes too long      | Use direct REST API calls (same data, no MCP dependency) — switch to MCP in demo if working                  |
| Claude generates hallucinated evidence | Strict prompt: "only use data from the evidence JSON provided. If a field is null, state it as unavailable." |
| Webhook not firing in test mode        | Use Razorpay CLI: `rzp trigger payment.dispute.created`                                                      |
| Supabase RLS blocks inserts            | Use service role key on server, anon key only on client                                                      |

---

_Build this. The chargeback problem is real, the MCP usage is deep, and the demo writes itself._
