// src/app/api/certifications/[certId]/exam/route.ts
// GET the certification exam assessment for a course
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { certId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Must be enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_certId: { userId: session.user.id, certId: params.certId } },
  });
  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  const exam = await prisma.assessment.findFirst({
    where:   { certId: params.certId, type: "CERTIFICATION_EXAM" },
    include: { _count: { select: { questions: true } } },
  });

  return NextResponse.json({ data: exam });
}
