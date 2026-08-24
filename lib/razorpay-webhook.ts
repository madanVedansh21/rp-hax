import crypto from "crypto";

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret = process.env.RAZORPAY_WEBHOOK_SECRET
): boolean {
  if (!signature || !secret) {
    // If webhook secret isn't set, in test/demo mode allow or log warning
    if (process.env.NEXT_PUBLIC_APP_MODE === "test" || !secret) {
      return true;
    }
    return false;
  }

  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf-8"),
      Buffer.from(expected, "utf-8")
    );
  } catch (err) {
    console.error("HMAC verification error:", err);
    return false;
  }
}
