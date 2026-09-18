import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { certId } = await req.json();

    const cert = await prisma.certification.findUnique({
      where: { id: certId },
    });

    if (!cert) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_certId: {
          userId: session.user.id,
          certId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already enrolled" },
        { status: 400 }
      );
    }

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
            currency: "usd",
            unit_amount: Math.round(Number(cert.price) * 100),
            product_data: {
              name: cert.title,
              description: cert.description ?? undefined,
            },
          },
        },
      ],

      success_url:
        `${process.env.NEXT_PUBLIC_APP_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${process.env.NEXT_PUBLIC_APP_URL}/certifications/${cert.id}`,

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
        currency: "USD",
        status: "PENDING",
      },
    });

    return NextResponse.json({
      data: {
        checkoutUrl: sessionCheckout.url,
      },
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    );
  }
}
