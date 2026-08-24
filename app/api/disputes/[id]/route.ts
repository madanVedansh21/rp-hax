import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const disputeId = params.id;
    const dispute = await db.getDisputeWithDetails(disputeId);

    if (!dispute) {
      return NextResponse.json(
        { error: "Dispute not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, dispute });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch dispute details", details: err?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const disputeId = params.id;
    const dispute = await db.getDisputeByDisputeId(disputeId);

    if (!dispute) {
      return NextResponse.json(
        { error: "Dispute not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { status, summary, merchant_statement, evidence_index, missing_evidence } = body;

    // Update dispute status if provided
    if (status) {
      await db.upsertDispute({
        id: dispute.id,
        dispute_id: dispute.dispute_id,
        status,
      });
    }

    // Update draft if draft fields provided
    if (summary !== undefined || merchant_statement !== undefined || evidence_index !== undefined) {
      await db.upsertDraft(dispute.id, {
        summary,
        merchant_statement,
        evidence_index,
        missing_evidence,
        is_edited: true,
      });

      // Log merchant edit action
      await db.insertLog(dispute.id, {
        action: "MERCHANT_EDIT",
        status: "SUCCESS",
        detail: {
          timestamp: new Date().toISOString(),
          edited_fields: Object.keys(body),
        },
      });
    }

    if (status === "submitted") {
      await db.insertLog(dispute.id, {
        action: "SUBMIT_TO_RAZORPAY",
        status: "SUCCESS",
        detail: {
          submitted_at: new Date().toISOString(),
          package_version: "v1.0-final",
        },
      });
    }

    const updated = await db.getDisputeWithDetails(dispute.id);
    return NextResponse.json({ success: true, dispute: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update dispute", details: err?.message },
      { status: 500 }
    );
  }
}
