// ─────────────────────────────────────────────────────────────
//  src/app/api/payments/webhook/razorpay/route.ts
//  Verifies Razorpay webhook signature and fulfills enrollment.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const secret    = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expected)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id as string;

    const dbPayment = await prisma.payment.findFirst({ where: { orderId } });

    if (dbPayment && dbPayment.status !== "COMPLETED") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: dbPayment.id },
          data:  { status: "COMPLETED", gatewayId: payment.id },
        }),
        prisma.enrollment.upsert({
          where:  { userId_certId: { userId: dbPayment.userId, certId: dbPayment.certId } },
          create: { userId: dbPayment.userId, certId: dbPayment.certId, paidAmount: dbPayment.amount },
          update: {},
        }),
      ]);
    }
  }

  if (event.event === "payment.failed") {
    const payment = event.payload.payment.entity;
    await prisma.payment.updateMany({
      where: { orderId: payment.order_id },
      data:  { status: "FAILED" },
    });
  }

  return NextResponse.json({ received: true });
}

