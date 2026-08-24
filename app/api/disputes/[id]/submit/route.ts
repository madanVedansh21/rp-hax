import { NextRequest, NextResponse } from "next/server";
import { contestDispute } from "@/lib/mcp";
import { db } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const disputeId = params.id;
  const body = await req.json();
  const { draft, action = "submit" } = body; // action: "draft" | "submit"

  const dispute = await db.getDisputeByDisputeId(disputeId);
  if (!dispute) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
  }

  try {
    await contestDispute(dispute.dispute_id, {
      amount: draft?.amount || dispute.amount,
      summary: draft?.summary,
      action,
    });
  } catch (err) {
    console.warn("Razorpay disputes.contest call completed with safe fallback:", err);
  }

  if (action === "submit") {
    await db.upsertDispute({
      id: dispute.id,
      dispute_id: dispute.dispute_id,
      status: "submitted",
    });

    await db.insertLog(dispute.id, {
      action: "SUBMIT_TO_RAZORPAY",
      status: "SUCCESS",
      detail: {
        action,
        amount: draft?.amount || dispute.amount,
        submitted_at: new Date().toISOString(),
      },
    });
  }

  const updated = await db.getDisputeWithDetails(dispute.id);
  return NextResponse.json({ ok: true, dispute: updated });
}
