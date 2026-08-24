import { DisputeReasonCode, EvidenceItem, EvidenceStrategy } from "./types";

export function classifyDispute(
  reasonCode: DisputeReasonCode,
  evidence: EvidenceItem[]
): EvidenceStrategy {
  const code = (reasonCode || "general").toLowerCase().trim();

  // Check what evidence we actually have
  const availableSources = new Set(
    evidence.filter((e) => e.available).map((e) => e.source)
  );

  switch (code) {
    case "fraud":
      return {
        reason_code: "fraud",
        claim_summary:
          "Customer / Issuing bank claims unauthorized transaction or fraudulent card misuse.",
        required_evidence_sources: [
          "fetch_payment",
          "fetch_payment_card_details",
          "fetch_order",
        ],
        key_arguments: [
          "Transaction was authenticated with Two-Factor / 3D-Secure OTP verification mandated by RBI.",
          "Payment was captured from verified device and IP address associated with cardholder.",
          "Order details and receipt were dispatched to the cardholder's verified email and phone.",
        ],
        recommended_merchant_points: [
          "Highlight 3DS authentication authorization code.",
          "Provide IP address and browser/device fingerprint logs.",
          "Demonstrate matched billing and delivery contact info.",
        ],
      };

    case "not_received":
      return {
        reason_code: "not_received",
        claim_summary:
          "Customer claims that ordered goods or services were never delivered.",
        required_evidence_sources: [
          "fetch_payment",
          "fetch_order",
          "fetch_order_payments",
        ],
        key_arguments: [
          "Order was fulfilled and handed over to logistics carrier with active tracking ID.",
          "Delivery address on the order matches the customer's provided delivery coordinates.",
          "Merchant maintained active communication channel and has had zero prior unaddressed complaints.",
        ],
        recommended_merchant_points: [
          "Include courier tracking link and AWB / Waybill number.",
          "State proof of delivery (POD) / OTP / signature timestamp if logged.",
          "Show order confirmation receipt.",
        ],
      };

    case "not_as_described":
      return {
        reason_code: "not_as_described",
        claim_summary:
          "Customer claims product/service received does not match description on website.",
        required_evidence_sources: ["fetch_payment", "fetch_order"],
        key_arguments: [
          "Delivered item matches the exact SKU, specifications, and description presented during checkout.",
          "Clear product terms, specifications, and cancellation/return policies were acknowledged by customer at payment.",
          "No defect or return request was initiated with merchant support prior to dispute filing.",
        ],
        recommended_merchant_points: [
          "Attach product catalog specification sheet.",
          "Provide customer acknowledgment of merchant return policy.",
          "Show customer support timeline.",
        ],
      };

    case "duplicate":
      return {
        reason_code: "duplicate",
        claim_summary:
          "Customer claims they were billed multiple times for a single order.",
        required_evidence_sources: [
          "fetch_payment",
          "fetch_order",
          "fetch_order_payments",
          "fetch_refunds",
        ],
        key_arguments: [
          "Only a single payment was captured for the specific Order ID; other attempts either failed or were voided.",
          "Razorpay settlement ledger confirms single settlement to merchant account.",
          "If any secondary charge was authorized, full refund trail was promptly executed.",
        ],
        recommended_merchant_points: [
          "Display all payment attempts showing only 1 captured state.",
          "Show order total versus net captured amount.",
        ],
      };

    case "subscription_cancelled":
      return {
        reason_code: "subscription_cancelled",
        claim_summary:
          "Customer claims subscription renewal charge occurred after cancellation.",
        required_evidence_sources: [
          "fetch_payment",
          "fetch_order",
          "fetch_refunds",
        ],
        key_arguments: [
          "Recurring billing charge was processed according to authorized mandate schedule prior to cancellation notice.",
          "Customer was sent advance renewal reminder notification as per regulatory norms.",
          "Terms of recurring billing were explicitly agreed upon during signup.",
        ],
        recommended_merchant_points: [
          "Provide mandate registration timestamp and renewal notification log.",
          "Show cancellation policy and effective cutoff date.",
        ],
      };

    case "general":
    default:
      return {
        reason_code: "general",
        claim_summary:
          "Bank initiated dispute requiring comprehensive transaction and fulfillment evidence.",
        required_evidence_sources: [
          "fetch_payment",
          "fetch_order",
          "fetch_payment_card_details",
          "fetch_refunds",
        ],
        key_arguments: [
          "Legitimate payment authorized through Razorpay gateway with complete verification checks.",
          "Order successfully fulfilled according to merchant terms and conditions.",
          "No refund dispute or complaint was submitted prior to chargeback notification.",
        ],
        recommended_merchant_points: [
          "Provide complete payment ledger record.",
          "Provide order fulfillment and delivery confirmation.",
          "Include customer contact logs.",
        ],
      };
  }
}
