import jsPDF from "jspdf";
import { DisputeWithDetails } from "./types";

export function generateDisputePdf(dispute: DisputeWithDetails): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;
  const leftMargin = 16;
  const contentWidth = pageWidth - leftMargin * 2;

  // Header Banner
  doc.setFillColor(12, 35, 64); // Razorpay navy
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CHARGEBACK EVIDENCE & DEFENSE PACKAGE", leftMargin, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Razorpay Merchant Dispute Submission  •  Generated: ${new Date().toLocaleDateString("en-IN")}`,
    leftMargin,
    19
  );

  y = 36;
  doc.setTextColor(15, 23, 42); // slate 900

  // Dispute Metadata Table / Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(leftMargin, y, contentWidth, 28, 2, 2, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Dispute ID:", leftMargin + 4, y + 7);
  doc.text("Payment ID:", leftMargin + 4, y + 14);
  doc.text("Order ID:", leftMargin + 4, y + 21);

  doc.setFont("helvetica", "normal");
  doc.text(dispute.dispute_id, leftMargin + 28, y + 7);
  doc.text(dispute.payment_id, leftMargin + 28, y + 14);
  doc.text(dispute.order_id || "N/A", leftMargin + 28, y + 21);

  const midX = leftMargin + contentWidth / 2;
  doc.setFont("helvetica", "bold");
  doc.text("Disputed Amount:", midX, y + 7);
  doc.text("Reason Code:", midX, y + 14);
  doc.text("Evidence Strength:", midX, y + 21);

  doc.setFont("helvetica", "normal");
  doc.text(`INR ${(dispute.amount / 100).toLocaleString("en-IN")}`, midX + 34, y + 7);
  doc.text(dispute.reason_code.toUpperCase(), midX + 34, y + 14);
  doc.text(dispute.strength_score || "STRONG", midX + 34, y + 21);

  y += 36;

  // Section 1: Executive Bank Summary
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(12, 35, 64);
  doc.text("1. EXECUTIVE DISPUTE SUMMARY (FOR BANK REVIEWER)", leftMargin, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  const summaryText =
    dispute.draft?.summary ||
    `This evidence package is submitted in defense against Dispute ${dispute.dispute_id}. Transaction was authorized via Razorpay payment gateway with full compliance.`;
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(splitSummary, leftMargin, y);
  y += splitSummary.length * 4.5 + 6;

  // Section 2: Merchant Statement
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(12, 35, 64);
  doc.text("2. MERCHANT STATEMENT", leftMargin, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  const statementText =
    dispute.draft?.merchant_statement ||
    `I confirm that payment ${dispute.payment_id} was processed legitimately for the customer. Goods/services were fulfilled in compliance with merchant terms.`;
  const splitStatement = doc.splitTextToSize(statementText, contentWidth);
  doc.text(splitStatement, leftMargin, y);
  y += splitStatement.length * 4.5 + 6;

  // Section 3: Itemized Evidence Index
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(12, 35, 64);
  doc.text("3. ITEMIZED EVIDENCE INDEX & RELEVANCE", leftMargin, y);
  y += 6;

  const items = dispute.draft?.evidence_index || [];
  if (items.length > 0) {
    items.forEach((item, index) => {
      // Check page overflow
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(leftMargin, y, contentWidth, 18, 1, 1, "F");

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`Item ${index + 1}: ${item.title}`, leftMargin + 3, y + 5);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);

      const itemSummary = doc.splitTextToSize(`• Summary: ${item.summary}`, contentWidth - 6);
      doc.text(itemSummary, leftMargin + 3, y + 10);

      y += 21;
    });
  }

  // Section 4: Missing Evidence / Recommendations (if any)
  if (dispute.draft?.missing_evidence && dispute.draft.missing_evidence.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 83, 9); // amber 700
    doc.text("Recommended Supplementary Merchant Documents:", leftMargin, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    dispute.draft.missing_evidence.forEach((rec) => {
      doc.text(`- ${rec}`, leftMargin + 2, y);
      y += 4.5;
    });
    y += 4;
  }

  // Footer / Signature line
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.line(leftMargin, y, leftMargin + contentWidth, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Autonomously gathered and generated by ChargebackAI Agent via Razorpay MCP Server & Claude AI. Complies with bank dispute response submission standards.",
    leftMargin,
    y
  );

  return doc;
}
