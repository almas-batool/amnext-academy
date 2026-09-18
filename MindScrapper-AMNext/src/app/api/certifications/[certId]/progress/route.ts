// src/app/api/certifications/[certId]/progress/route.ts
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

  const xpTx = await prisma.xPTransaction.findMany({
    where:  { userId: session.user.id, reason: "chapter_read", metadata: { path: ["certId"], equals: params.certId } },
    select: { metadata: true },
  });

  return NextResponse.json({
    data: {
      enrolled:       !!enrollment,
      progress:       enrollment?.progress ?? 0,
      completedAt:    enrollment?.completedAt,
      chaptersRead:   xpTx.length,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { certId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { progress } = await req.json();

  const enrollment = await prisma.enrollment.updateMany({
    where: { userId: session.user.id, certId: params.certId },
    data:  { progress: Math.min(1, Math.max(0, progress)) },
  });

  return NextResponse.json({ data: enrollment });
}
