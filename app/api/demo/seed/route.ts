import { NextResponse } from "next/server";
import { db, mockStore } from "@/lib/supabase";
import { runAgent } from "@/lib/agent";

export async function POST() {
  try {
    // Clear existing mock demo data for clean state
    await mockStore.clearAll();

    const sampleDisputes = [
      {
        dispute_id: "disp_FRAUD_001",
        payment_id: "pay_ABC123",
        order_id: "order_XYZ001",
        amount: 850000, // ₹8,500
        currency: "INR",
        reason_code: "fraud",
        respond_by: new Date(Date.now() + 3 * 86400000).toISOString(),
        status: "pending" as const,
      },
      {
        dispute_id: "disp_NOTREC_002",
        payment_id: "pay_DEF456",
        order_id: "order_XYZ002",
        amount: 1200000, // ₹12,000
        currency: "INR",
        reason_code: "not_received",
        respond_by: new Date(Date.now() + 1 * 86400000).toISOString(),
        status: "pending" as const,
      },
      {
        dispute_id: "disp_DUPLICATE_003",
        payment_id: "pay_GHI789",
        order_id: "order_XYZ003",
        amount: 400000, // ₹4,000
        currency: "INR",
        reason_code: "duplicate",
        respond_by: new Date(Date.now() + 6 * 86400000).toISOString(),
        status: "pending" as const,
      },
    ];

    for (const d of sampleDisputes) {
      await db.upsertDispute(d);
      // Run agent sequentially for the seeded disputes
      await runAgent(d.dispute_id);
    }

    const disputes = await db.getDisputes();
    return NextResponse.json({
      success: true,
      message: "Seeded 3 test disputes and completed agent runs",
      count: disputes.length,
      disputes,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to seed demo data", details: err?.message },
      { status: 500 }
    );
  }
}
