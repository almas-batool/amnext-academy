// ─────────────────────────────────────────────────────────────
//  src/lib/payments/stripe.ts
//  Stripe helpers — payment intent + webhook verification.
// ─────────────────────────────────────────────────────────────

export async function getStripeClient() {
  const Stripe = (await import("stripe")).default;
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-04-10" as any,
  });
}

export async function createPaymentIntent(params: {
  amount:   number;
  currency: string;
  metadata: Record<string, string>;
}) {
  const stripe = await getStripeClient();
  return stripe.paymentIntents.create({
    amount:   Math.round(params.amount * 100),
    currency: params.currency.toLowerCase(),
    metadata: params.metadata,
  });
}

export async function constructWebhookEvent(body: string, signature: string) {
  const stripe = await getStripeClient();
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

