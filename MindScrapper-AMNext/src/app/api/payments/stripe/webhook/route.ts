//src/app/api/payments/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent } from "@/lib/payments/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const signature = headers().get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const event = await constructWebhookEvent(body, signature);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const userId = session.metadata.userId;
      const certId = session.metadata.certId;

      const payment = await prisma.payment.findFirst({
        where: {
          gatewayId: session.payment_intent,
        },
      });

      if (payment && payment.status !== "COMPLETED") {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: {
              id: payment.id,
            },
            data: {
              status: "COMPLETED",
            },
          });

          const enrollment = await tx.enrollment.findUnique({
            where: {
              userId_certId: {
                userId,
                certId,
              },
            },
          });

          if (!enrollment) {
            await tx.enrollment.create({
              data: {
                userId,
                certId,
                paidAmount: payment.amount,
              },
            });
          }
        });
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Webhook Error",
      },
      {
        status: 400,
      },
    );
  }
}
