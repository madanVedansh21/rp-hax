import {
  fetchPayment,
  fetchOrder,
  fetchPaymentCardDetails,
  fetchRefunds,
  fetchOrderPayments,
  PaymentRecord,
  OrderRecord,
} from "./mcp";
import { classifyDispute } from "./classifier";
import { generateResponse } from "./generator";
import { db } from "./supabase";
import { AgentLog, EvidenceItem } from "./types";

export type AgentLogFn = (
  action: string,
  status: "SUCCESS" | "FAILED" | "SKIPPED" | "WARNING",
  detail?: Record<string, unknown>,
  durationMs?: number
) => Promise<void>;

export async function runAgent(disputeId: string): Promise<void> {
  const startTime = Date.now();

  // 1. Fetch Dispute record
  const dispute = await db.getDisputeByDisputeId(disputeId);
  if (!dispute) {
    console.error(`[Agent] Dispute not found: ${disputeId}`);
    return;
  }

  const disputeInternalId = dispute.id;

  const log: AgentLogFn = async (action, status, detail = {}, durationMs = 0) => {
    const entry: AgentLog = {
      action,
      status,
      detail,
      duration_ms: durationMs,
      created_at: new Date().toISOString(),
    };
    await db.insertLog(disputeInternalId, entry);
  };

  // Update status to in_progress
  await db.upsertDispute({
    id: dispute.id,
    dispute_id: dispute.dispute_id,
    status: "in_progress",
  });

  await log("AGENT_START", "SUCCESS", {
    dispute_id: dispute.dispute_id,
    payment_id: dispute.payment_id,
    amount: dispute.amount,
    reason_code: dispute.reason_code,
  });

  const evidence: EvidenceItem[] = [];

  // Step 1: Fetch Payment
  const payment = (await safeCall(
    () => fetchPayment(dispute.payment_id),
    "FETCH_PAYMENT",
    log
  )) as PaymentRecord | null;

  if (payment) {
    evidence.push({
      source: "fetch_payment",
      label: "Payment Record",
      content: payment as unknown as Record<string, unknown>,
      available: true,
    });
  } else {
    evidence.push({
      source: "fetch_payment",
      label: "Payment Record",
      content: null,
      available: false,
    });
  }

  // Determine order ID (from dispute or payment record)
  const effectiveOrderId = dispute.order_id || payment?.order_id;

  // Step 2: Fetch Order
  if (effectiveOrderId) {
    const order = (await safeCall(
      () => fetchOrder(effectiveOrderId),
      "FETCH_ORDER",
      log
    )) as OrderRecord | null;

    if (order) {
      evidence.push({
        source: "fetch_order",
        label: "Order Record",
        content: order as unknown as Record<string, unknown>,
        available: true,
      });
    } else {
      evidence.push({
        source: "fetch_order",
        label: "Order Record",
        content: null,
        available: false,
      });
    }
  } else {
    await log("FETCH_ORDER", "SKIPPED", { reason: "No order_id associated with payment" });
  }

  // Step 3: Fetch Card / Payment Auth Details (if card or 3DS applicable)
  if (payment?.method === "card" || payment?.card_id || dispute.reason_code === "fraud") {
    const card = await safeCall(
      () => fetchPaymentCardDetails(dispute.payment_id, payment?.card_id),
      "FETCH_CARD_DETAILS",
      log
    );

    if (card) {
      evidence.push({
        source: "fetch_payment_card_details",
        label: "Card & 3DS Authentication Record",
        content: card as unknown as Record<string, unknown>,
        available: true,
      });
    }
  }

  // Step 4: Fetch Refunds
  const refunds = await safeCall(
    () => fetchRefunds(dispute.payment_id),
    "FETCH_REFUNDS",
    log
  );

  if (refunds) {
    evidence.push({
      source: "fetch_refunds",
      label: "Refund History",
      content: { items: refunds },
      available: true,
    });
  }

  // Step 5: Fetch Order Payments (for duplicate or multi-attempt dispute defense)
  if (effectiveOrderId) {
    const orderPayments = await safeCall(
      () => fetchOrderPayments(effectiveOrderId),
      "FETCH_ORDER_PAYMENTS",
      log
    );

    if (orderPayments && Array.isArray(orderPayments) && orderPayments.length > 0) {
      evidence.push({
        source: "fetch_order_payments",
        label: "Order Payment Attempts Ledger",
        content: { attempts: orderPayments },
        available: true,
      });
    }
  }

  // 3. Save gathered evidence to DB
  await db.insertEvidence(disputeInternalId, evidence);

  // 4. Classify & strategize
  const strategyStart = Date.now();
  const strategy = classifyDispute(dispute.reason_code, evidence);
  await log("CLASSIFY", "SUCCESS", {
    reason_code: strategy.reason_code,
    required_sources: strategy.required_evidence_sources,
  }, Date.now() - strategyStart);

  // 5. Generate AI dispute response package
  const generateStart = Date.now();
  const draft = await generateResponse(dispute, evidence, strategy);
  await log("GENERATE", "SUCCESS", {
    strength_score: draft.strength_score,
    missing_evidence_count: draft.missing_evidence.length,
    evidence_items_indexed: draft.evidence_index.length,
  }, Date.now() - generateStart);

  // 6. Save response draft
  await db.upsertDraft(disputeInternalId, draft);

  // 7. Update dispute status to ready
  await db.upsertDispute({
    id: dispute.id,
    dispute_id: dispute.dispute_id,
    status: "ready",
    strength_score: draft.strength_score,
  });

  const totalDuration = Date.now() - startTime;
  await log("AGENT_COMPLETE", "SUCCESS", {
    total_duration_ms: totalDuration,
    evidence_count: evidence.filter((e) => e.available).length,
    strength: draft.strength_score,
  }, totalDuration);
}

// safeCall wrapper: times execution, handles errors safely without throwing
async function safeCall<T>(
  fn: () => Promise<T>,
  action: string,
  log: AgentLogFn
): Promise<T | null> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    await log(action, "SUCCESS", {}, duration);
    return result;
  } catch (err: any) {
    const duration = Date.now() - start;
    await log(action, "FAILED", { error: err?.message || String(err) }, duration);
    return null;
  }
}
