import Razorpay from "razorpay";

export const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

export const fetchPayment = (id: string) => rzp.payments.fetch(id);
export const fetchOrder = (id: string) => rzp.orders.fetch(id);
export const fetchRefunds = (paymentId: string) =>
  (rzp.refunds.all as any)({ payment_id: paymentId });
export const fetchDispute = (id: string) => (rzp as any).disputes.fetch(id);
export const contestDispute = (id: string, body: object) =>
  (rzp as any).disputes.contest(id, body);
