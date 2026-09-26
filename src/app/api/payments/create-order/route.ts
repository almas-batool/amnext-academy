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

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!stripeSecretKey || (!stripeSecretKey.startsWith("sk_test_") && !stripeSecretKey.startsWith("sk_live_"))) {
      console.error("Stripe checkout is not configured with a valid server secret key.");
      return NextResponse.json(
        { error: "Stripe checkout is not configured. Add a valid STRIPE_SECRET_KEY on the server." },
        { status: 503 },
      );
    }

    const amount = Math.round(Number(cert.price) * 100);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "This course has an invalid price." },
        { status: 400 },
      );
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(req.url).origin).replace(/\/$/, "");
    let baseUrl: URL;
    try {
      baseUrl = new URL(appUrl);
      if (!/^https?:$/.test(baseUrl.protocol)) throw new Error("Unsupported URL protocol");
    } catch {
      console.error("Stripe checkout has an invalid NEXT_PUBLIC_APP_URL.");
      return NextResponse.json(
        { error: "Stripe checkout is not configured with a valid application URL." },
        { status: 503 },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-03-31.basil" as any,
      timeout: 20_000,
      maxNetworkRetries: 2,
    });

    const sessionCheckout = await stripe.checkout.sessions.create({
      mode: "payment",
      managed_payments: { enabled: true },

      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: cert.title,
              description: cert.description ?? undefined,
              // Managed Payments requires a tax code for digitally delivered courses.
              tax_code: "txcd_10000000",
            },
          },
        },
      ],

      success_url:
        `${baseUrl.origin}/payments/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${baseUrl.origin}/certifications/${cert.id}`,

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
    const message = error instanceof Error ? error.message : "Unknown Stripe error";
    console.error("Stripe checkout error:", message);

    return NextResponse.json(
      { error: "Unable to create checkout session. Verify the server Stripe configuration and try again." },
      { status: 500 }
    );
  }
}
