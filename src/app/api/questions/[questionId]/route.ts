// ─────────────────────────────────────────────────────────────
//  src/app/api/questions/[questionId]/route.ts
//  PUT/DELETE a single question (instructor/admin)
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

async function getQuestionWithOwner(questionId: string) {
  return prisma.question.findUnique({
    where:   { id: questionId },
    include: { assessment: { include: { cert: { select: { instructorId: true } } } } },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { questionId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const question = await getQuestionWithOwner(params.questionId);
  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (question.assessment.cert.instructorId !== session.user.id && session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.question.update({
    where: { id: params.questionId },
    data:  body,
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { questionId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const question = await getQuestionWithOwner(params.questionId);
  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (question.assessment.cert.instructorId !== session.user.id && session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.question.delete({ where: { id: params.questionId } });

  return NextResponse.json({ message: "Question deleted" });
}
