// src/app/api/certificates/route.ts
// GET — list user's certificates
// POST — generate certificate after exam pass
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET() {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const certs = await prisma.certificate.findMany({
    where:   { userId: session.user.id },
    include: { cert: { select: { title: true, category: true, difficulty: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json({ data: certs });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { certId, score } = await req.json();
  if (!certId) return NextResponse.json({ error: "certId required" }, { status: 400 });

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_certId: { userId: session.user.id, certId } },
  });
  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  const { issueCertificate } = await import("@/lib/services/certificate.service");
  const result               = await issueCertificate(session.user.id, certId, score);

  return NextResponse.json({ data: result }, { status: 201 });
}
