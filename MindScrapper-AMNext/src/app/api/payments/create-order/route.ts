// ─────────────────────────────────────────────────────────────
//  src/app/api/payments/create-order/route.ts
//  Creates a Razorpay or Stripe payment order.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { certId, gateway = "RAZORPAY" } = await req.json();

  const cert = await prisma.certification.findUnique({ where: { id: certId } });
  if (!cert)
    return NextResponse.json(
      { error: "Certification not found" },
      { status: 404 },
    );

  const existing = await prisma.enrollment.findUnique({
    where: { userId_certId: { userId: session.user.id, certId } },
  });
  if (existing)
    return NextResponse.json({ error: "Already enrolled" }, { status: 400 });

  if (gateway === "RAZORPAY") {
    const Razorpay = (await import("razorpay")).default;
    const rp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const amountPaise = Math.round(Number(cert.price) * 100);
    const order = await rp.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `lf_${session.user.id.slice(-6)}_${certId.slice(-6)}`,
      notes: { userId: session.user.id, certId },
    });

    await prisma.payment.create({
      data: {
        userId: session.user.id,
        certId,
        gateway: "RAZORPAY",
        gatewayId: order.id as string,
        orderId: order.id as string,
        amount: cert.price,
        currency: "INR",
        status: "PENDING",
      },
    });

    return NextResponse.json({
      data: {
        orderId: order.id,
        amount: amountPaise,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
        certTitle: cert.title,
        userName: session.user.name,
        userEmail: session.user.email,
      },
    });
  }

  // ==============================
  // Stripe Checkout
  // ==============================

  const Stripe = (await import("stripe")).default;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-04-10" as any,
  });

  const sessionCheckout = await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],

    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: cert.currency.toLowerCase(),

          unit_amount: Math.round(Number(cert.price) * 100),

          product_data: {
            name: cert.title,
            description: cert.description ?? undefined,
          },
        },
      },
    ],

    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/certifications/${cert.id}`,

    metadata: {
      userId: session.user.id,
      certId,
    },
  });

  await prisma.payment.create({
    data: {
      userId: session.user.id,
      certId,

      gateway: "STRIPE",

      gatewayId: sessionCheckout.id,

      amount: cert.price,

      currency: cert.currency,

      status: "PENDING",
    },
  });

  return NextResponse.json({
    data: {
      checkoutUrl: sessionCheckout.url,
    },
  });
}
