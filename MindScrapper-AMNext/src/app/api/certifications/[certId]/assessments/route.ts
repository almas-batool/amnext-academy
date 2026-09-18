// ─────────────────────────────────────────────────────────────
//  src/app/api/certifications/[certId]/assessments/route.ts
//  GET  — list assessments for a certification
//  POST — create a new assessment (quiz or final exam)
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { certId: string } }
) {
  const assessments = await prisma.assessment.findMany({
    where:   { certId: params.certId },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ data: assessments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { certId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cert = await prisma.certification.findUnique({ where: { id: params.certId } });
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (cert.instructorId !== session.user.id && session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const {
    title, description, type, passMark, timeLimit, negMark, randomize, maxAttempts,
  } = body;

  if (!title?.trim() || !type)
    return NextResponse.json({ error: "title and type are required" }, { status: 400 });

  // Only one CERTIFICATION_EXAM allowed per cert
  if (type === "CERTIFICATION_EXAM") {
    const existing = await prisma.assessment.findFirst({
      where: { certId: params.certId, type: "CERTIFICATION_EXAM" },
    });
    if (existing)
      return NextResponse.json({ error: "A certification exam already exists for this course" }, { status: 400 });
  }

  const assessment = await prisma.assessment.create({
    data: {
      certId:      params.certId,
      title:       title.trim(),
      description: description ?? null,
      type,
      passMark:    passMark    ?? 70,
      timeLimit:   timeLimit   ?? null,
      negMark:     negMark     ?? 0,
      randomize:   randomize   ?? true,
      maxAttempts: maxAttempts ?? null,
    },
  });

  return NextResponse.json({ data: assessment }, { status: 201 });
}
