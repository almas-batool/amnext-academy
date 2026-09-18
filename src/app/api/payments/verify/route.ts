// ─────────────────────────────────────────────────────────────
// src/app/api/payments/verify/route.ts
// Verify Razorpay payment and enroll the student.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      certId,
    } = await req.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !certId
    ) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 },
      );
    }

    const valid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        orderId: razorpay_order_id,
        userId: session.user.id,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Already processed
    if (payment.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "COMPLETED",
          gatewayId: razorpay_payment_id,
          metadata: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
          },
        },
      });

      const exists = await tx.enrollment.findUnique({
        where: {
          userId_certId: {
            userId: session.user.id,
            certId,
          },
        },
      });

      if (!exists) {
        await tx.enrollment.create({
          data: {
            userId: session.user.id,
            certId,
            paidAmount: payment.amount,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Payment verification failed",
      },
      {
        status: 500,
      },
    );
  }
}

