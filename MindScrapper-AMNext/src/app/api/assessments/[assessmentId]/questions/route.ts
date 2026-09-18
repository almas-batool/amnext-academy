// ─────────────────────────────────────────────────────────────
//  src/app/api/assessments/[assessmentId]/questions/route.ts
//  GET  — list questions WITH answers (instructor/admin only)
//  POST — add a question to an assessment
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

async function assertOwnership(assessmentId: string, userId: string, role: string) {
  const assessment = await prisma.assessment.findUnique({
    where:   { id: assessmentId },
    include: { cert: { select: { instructorId: true } } },
  });
  if (!assessment) return { error: "Not found", status: 404 } as const;
  if (assessment.cert.instructorId !== userId && role !== "ADMIN")
    return { error: "Forbidden", status: 403 } as const;
  return { assessment } as const;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await assertOwnership(params.assessmentId, session.user.id, session.user.role);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const questions = await prisma.question.findMany({
    where:   { assessmentId: params.assessmentId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ data: questions });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await assertOwnership(params.assessmentId, session.user.id, session.user.role);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json();
  const { type, body: questionBody, options, answer, explanation, points, difficulty } = body;

  if (!type || !questionBody?.trim() || answer === undefined || answer === null)
    return NextResponse.json({ error: "type, body, and answer are required" }, { status: 400 });

  // Validate answer format per type
  if (type === "MSQ") {
    try {
      const parsed = JSON.parse(answer);
      if (!Array.isArray(parsed)) throw new Error();
    } catch {
      return NextResponse.json({ error: "MSQ answer must be a JSON array string, e.g. [\"a\",\"c\"]" }, { status: 400 });
    }
  }

  if (["MCQ", "MSQ", "TRUE_FALSE"].includes(type) && (!options || !Array.isArray(options) || options.length < 2))
    return NextResponse.json({ error: "options array (min 2 items) required for this question type" }, { status: 400 });

  const count = await prisma.question.count({ where: { assessmentId: params.assessmentId } });

  const question = await prisma.question.create({
    data: {
      assessmentId: params.assessmentId,
      type,
      body:         questionBody.trim(),
      options:      options ?? null,
      answer:       String(answer),
      explanation:  explanation ?? null,
      points:       points     ?? 1,
      difficulty:   difficulty ?? "INTERMEDIATE",
      order:        count,
    },
  });

  return NextResponse.json({ data: question }, { status: 201 });
}
