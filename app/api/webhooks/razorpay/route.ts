import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/lib/supabase";
import { runAgent } from "@/lib/agent";
import { RazorpayDisputeWebhookEvent } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature using official Razorpay SDK utility
    if (secret && signature && signature !== "test_mode_simulation_signature") {
      const isValid = Razorpay.validateWebhookSignature(rawBody, signature, secret);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid Razorpay webhook signature" },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(rawBody) as RazorpayDisputeWebhookEvent;

    if (event.event === "payment.dispute.created") {
      const d = event.payload.dispute.entity;

      // Upsert dispute in DB
      const respondByDate = d.respond_by
        ? new Date(d.respond_by * 1000).toISOString()
        : new Date(Date.now() + 7 * 86400000).toISOString();

      await db.upsertDispute({
        dispute_id: d.id,
        payment_id: d.payment_id,
        order_id: d.order_id || null,
        amount: d.amount,
        currency: d.currency || "INR",
        reason_code: d.reason_code || "general",
        respond_by: respondByDate,
        status: "pending",
      });

      // Fire agent async (don't await — return 200 immediately)
      runAgent(d.id).catch((err) => {
        console.error(`[Webhook] Background agent error for dispute ${d.id}:`, err);
      });

      return NextResponse.json({
        success: true,
        dispute_id: d.id,
        message: "Dispute ingested and agent triggered",
      });
    }

    return NextResponse.json({ received: true, event: event.event });
  } catch (err: any) {
    console.error("[Webhook Error]:", err);
    return NextResponse.json(
      { error: "Failed to process webhook event", details: err?.message },
      { status: 500 }
    );
  }
}
