// ─────────────────────────────────────────────────────────────
//  src/app/api/assessments/[assessmentId]/route.ts
//  GET assessment with questions (answers hidden from client)
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assessment = await prisma.assessment.findUnique({
    where:   { id: params.assessmentId },
    include: {
      questions: {
        select: {
          id:         true,
          type:       true,
          body:       true,
          options:    true,
          points:     true,
          difficulty: true,
          order:      true,
          // answer is intentionally omitted
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let questions = assessment.questions;
  if (assessment.randomize) {
    questions = [...questions].sort(() => Math.random() - 0.5);
  }

  return NextResponse.json({
    data: {
      id:            assessment.id,
      title:         assessment.title,
      description:   assessment.description,
      type:          assessment.type,
      passMark:      assessment.passMark,
      timeLimit:     assessment.timeLimit,
      negMark:       assessment.negMark,
      questionCount: questions.length,
      questions,
    },
  });
}
