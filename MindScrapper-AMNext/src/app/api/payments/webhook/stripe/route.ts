// src/app/api/payments/webhook/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: any;
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi     = event.data.object;
    const userId = pi.metadata?.userId;
    const certId = pi.metadata?.certId;

    if (userId && certId) {
      const dbPayment = await prisma.payment.findFirst({ where: { gatewayId: pi.id } });
      if (dbPayment && dbPayment.status !== "COMPLETED") {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: dbPayment.id },
            data:  { status: "COMPLETED" },
          }),
          prisma.enrollment.upsert({
            where:  { userId_certId: { userId, certId } },
            create: { userId, certId, paidAmount: dbPayment.amount },
            update: {},
          }),
        ]);
      }
    }
  }

  return NextResponse.json({ received: true });
}
