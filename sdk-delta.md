# SDK Delta — What Changed & What Your AI Agent Should Do

> Read this alongside the PRD. This is the only file that changes anything.

---

## What Changed

### 1. `lib/mcp.ts` — Full Replacement

**Old:** Raw `fetch()` calls with manual base64 auth headers.  
**New:** Official Razorpay Node SDK. Cleaner, typed, no manual auth.

**Old install:**

```bash
npm install @anthropic-ai/sdk @supabase/supabase-js razorpay jspdf
```

The package name `razorpay` stays the same — but now you actually use it instead of just listing it. No new packages needed.

**Replace the entire `lib/mcp.ts` with this:**

```typescript
import Razorpay from "razorpay";

export const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const fetchPayment = (id: string) => rzp.payments.fetch(id);
export const fetchOrder = (id: string) => rzp.orders.fetch(id);
export const fetchRefunds = (paymentId: string) =>
  rzp.refunds.all({ payment_id: paymentId });
export const fetchDispute = (id: string) => rzp.disputes.fetch(id);
export const contestDispute = (id: string, body: object) =>
  rzp.disputes.contest(id, body);
```

That's the whole file. Every import in `lib/agent.ts` stays the same — the function signatures didn't change.

---

### 2. Submit Button is Now Real

**Old (PRD):** "Submit to Razorpay" generated a PDF. Actual bank submission was marked out-of-scope.  
**New:** The SDK has `rzp.disputes.contest()` which directly calls Razorpay's contest API. No RBI approval needed — this is Razorpay's own endpoint, not a bank-level API.

Two-stage flow (draft → submit):

```typescript
// Stage 1: Agent auto-drafts when evidence is ready
await rzp.disputes.contest(disputeId, {
  amount: dispute.amount,
  summary: draft.summary,
  action: "draft", // saves to Razorpay, status stays "open"
});

// Stage 2: Merchant reviews in dashboard, hits Submit
await rzp.disputes.contest(disputeId, {
  amount: dispute.amount,
  summary: draft.summary,
  action: "submit", // actually contests it, status → "under_review"
});
```

Add a new API route for this: `app/api/disputes/[id]/submit/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { contestDispute } from "@/lib/mcp";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { disputeId, draft, action } = await req.json(); // action: "draft" | "submit"

  await contestDispute(disputeId, {
    amount: draft.amount,
    summary: draft.summary,
    action,
  });

  if (action === "submit") {
    await supabase
      .from("disputes")
      .update({ status: "submitted" })
      .eq("dispute_id", disputeId);
  }

  return NextResponse.json({ ok: true });
}
```

Update your DB `disputes.status` enum to include `"submitted"`.

---

### 3. Agent Gets One Extra Step

The agent now auto-drafts to Razorpay after generating the response, before the merchant even opens the dashboard. This means the deadline clock starts ticking on Razorpay's side immediately — not just in your DB.

Add this to `lib/agent.ts` after step 6 (store draft), before step 7 (mark ready):

```typescript
// 6.5 — Auto-draft to Razorpay (buys time on the deadline)
await safeCall(
  () =>
    rzp.disputes.contest(dispute.dispute_id, {
      amount: dispute.amount,
      summary: draft.summary,
      action: "draft",
    }),
  "AUTO_DRAFT",
  log,
);
```

`safeCall` wraps it — if this fails, the agent still completes. The merchant can still manually submit from the dashboard.

---

### 4. Webhook Verification — Use SDK Utility

**Old (PRD):** Manual HMAC with `crypto`.  
**New:** SDK has `Razorpay.validateWebhookSignature()` built in. Same logic, less code.

Replace the verification block in `app/api/webhooks/razorpay/route.ts`:

```typescript
// Old
const expected = crypto
  .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
  .update(body)
  .digest("hex");
if (signature !== expected) { ... }

// New
import Razorpay from "razorpay";
const isValid = Razorpay.validateWebhookSignature(
  body,
  signature!,
  process.env.RAZORPAY_WEBHOOK_SECRET!
);
if (!isValid) { ... }
```

Same security, one less import (`crypto` can be removed).

---

## What Did NOT Change

Everything in the PRD that isn't listed above stays exactly as written.

- Supabase schema — unchanged
- File structure — unchanged
- `lib/agent.ts` orchestration logic — unchanged (except the one extra step above)
- `lib/classifier.ts` — unchanged
- `lib/generator.ts` — unchanged
- All dashboard UI — unchanged
- Build order Day 1 / Day 2 — unchanged
- Demo script — unchanged, except "Download PDF" button is now secondary to "Submit to Razorpay"

---

## Instructions for Your AI Agent (Cursor / Claude Code)

Give your coding agent these instructions verbatim when starting the build:

```
You are building ChargebackAI — a Next.js 14 app with Supabase,
Anthropic Claude API, and the official Razorpay Node SDK.

Primary reference: chargeback-agent-prd.md
Amendments to apply ON TOP of the PRD: sdk-delta.md

Rules:
1. Use the Razorpay Node SDK (npm package: razorpay) for ALL
   Razorpay API calls. Never use raw fetch() for Razorpay endpoints.
2. lib/mcp.ts must match the exact 7-line version in sdk-delta.md.
3. The disputes.contest() call with action:"draft" must fire inside
   the agent BEFORE the dispute is marked status:"ready".
4. The disputes.contest() call with action:"submit" fires from the
   API route app/api/disputes/[id]/submit/route.ts, triggered by
   the merchant clicking Submit in the dashboard.
5. Use Razorpay.validateWebhookSignature() for webhook verification,
   not manual crypto.createHmac().
6. Every Razorpay SDK call in lib/agent.ts must be wrapped in safeCall().
   A failed SDK call must be logged to agent_logs with status:"FAILED"
   and must NOT crash the agent.
7. Do not add any feature not listed in the PRD or this delta doc.
   Scope creep will cost you the hackathon.

Start with: Supabase schema → lib/mcp.ts → webhook handler → agent → frontend.
```

---

## Corrected Day 1 Build Order

Only step 3 changes. Everything else from the PRD is the same.

- [ ] Supabase project + schema (add `"submitted"` to status enum)
- [ ] Razorpay test account + webhook setup
- [ ] `/api/webhooks/razorpay` — use `Razorpay.validateWebhookSignature()` ← updated
- [ ] `lib/mcp.ts` — 7-line SDK version ← updated
- [ ] `lib/classifier.ts`
- [ ] `lib/agent.ts` — add AUTO_DRAFT step ← updated
- [ ] `lib/generator.ts`
- [ ] `/api/disputes/[id]/submit/route.ts` ← new file
- [ ] Test end-to-end with Razorpay CLI test dispute
