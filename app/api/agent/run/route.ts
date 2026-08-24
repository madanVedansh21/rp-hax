import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";
import { db } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dispute_id } = body;

    if (!dispute_id) {
      return NextResponse.json(
        { error: "Missing required field: dispute_id" },
        { status: 400 }
      );
    }

    const dispute = await db.getDisputeByDisputeId(dispute_id);
    if (!dispute) {
      return NextResponse.json(
        { error: `Dispute not found: ${dispute_id}` },
        { status: 404 }
      );
    }

    // Run agent
    await runAgent(dispute.dispute_id);

    const updated = await db.getDisputeWithDetails(dispute.id);
    return NextResponse.json({
      success: true,
      message: "Agent run completed successfully",
      dispute: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to run agent", details: err?.message },
      { status: 500 }
    );
  }
}
