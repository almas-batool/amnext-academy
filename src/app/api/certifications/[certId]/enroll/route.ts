// ─────────────────────────────────────────────────────────────
//  src/app/api/certifications/[certId]/enroll/route.ts
//  POST — enroll (free) or return payment intent (paid)
//  GET  — check enrollment status
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { certId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_certId: { userId: session.user.id, certId: params.certId } },
  });

  return NextResponse.json({ data: enrollment });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { certId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cert = await prisma.certification.findUnique({
    where: { id: params.certId },
  });
  if (!cert || cert.status !== "PUBLISHED")
    return NextResponse.json({ error: "Certification not available" }, { status: 404 });

  const existing = await prisma.enrollment.findUnique({
    where: { userId_certId: { userId: session.user.id, certId: params.certId } },
  });
  if (existing)
    return NextResponse.json({ data: existing, message: "Already enrolled" });

  // Free enrollment
  if (Number(cert.price) === 0) {
    const enrollment = await prisma.enrollment.create({
      data: {
        userId:     session.user.id,
        certId:     params.certId,
        paidAmount: 0,
      },
    });
    return NextResponse.json({ data: enrollment }, { status: 201 });
  }

  // Paid — client should call /api/payments/create-order next
  return NextResponse.json({
    requiresPayment: true,
    price:    cert.price,
    currency: "USD",
    certId:   cert.id,
    title:    cert.title,
  });
}
