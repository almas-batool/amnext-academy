// ─────────────────────────────────────────────────────────────
//  src/lib/payments/razorpay.ts
//  Razorpay helpers — order creation + signature verification.
// ─────────────────────────────────────────────────────────────

import crypto from "crypto";

let _razorpay: any;

export function getRazorpayClient() {
  if (!_razorpay) {
    // Dynamic import to avoid issues in edge runtime
    const Razorpay = require("razorpay");
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return _razorpay;
}

export async function createOrder(params: {
  amount:   number; // in INR
  receipt:  string;
  notes?:   Record<string, string>;
}) {
  const rp = getRazorpayClient();
  return rp.orders.create({
    amount:   Math.round(params.amount * 100), // paise
    currency: "INR",
    receipt:  params.receipt.slice(0, 40),
    notes:    params.notes ?? {},
  });
}

export function verifyPaymentSignature(params: {
  orderId:     string;
  paymentId:   string;
  signature:   string;
}): boolean {
  const body     = `${params.orderId}|${params.paymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expected === params.signature;
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  return expected === signature;
}
