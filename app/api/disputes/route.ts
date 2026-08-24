import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { runAgent } from "@/lib/agent";

export async function GET() {
  try {
    const disputes = await db.getDisputes();
    return NextResponse.json({ success: true, disputes });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch disputes", details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      dispute_id,
      payment_id,
      order_id,
      amount,
      currency = "INR",
      reason_code = "fraud",
      respond_by,
      auto_run = true,
    } = body;

    if (!dispute_id || !payment_id || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: dispute_id, payment_id, amount" },
        { status: 400 }
      );
    }

    const dispute = await db.upsertDispute({
      dispute_id,
      payment_id,
      order_id: order_id || null,
      amount: Number(amount),
      currency,
      reason_code,
      respond_by: respond_by || new Date(Date.now() + 5 * 86400000).toISOString(),
      status: "pending",
    });

    if (auto_run) {
      runAgent(dispute.dispute_id).catch(console.error);
    }

    return NextResponse.json({ success: true, dispute });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create dispute", details: err?.message },
      { status: 500 }
    );
  }
}
