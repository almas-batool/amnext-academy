// ─────────────────────────────────────────────────────────────
//  src/app/api/assessments/[assessmentId]/submit/route.ts
//  POST — grade exam attempt, award XP, issue cert if passed.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import { awardXP }        from "@/lib/services/gamification.service";

export async function POST(
  req: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { answers, startedAt } = await req.json();

  const assessment = await prisma.assessment.findUnique({
    where:   { id: params.assessmentId },
    include: { questions: true },
  });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check max attempts
  if (assessment.maxAttempts) {
    const count = await prisma.examAttempt.count({
      where: { userId: session.user.id, assessmentId: params.assessmentId },
    });
    if (count >= assessment.maxAttempts)
      return NextResponse.json({ error: "Maximum attempts reached" }, { status: 403 });
  }

  // ── Grade ────────────────────────────────────────────────────
  let score    = 0;
  let maxScore = 0;
  const gradedAnswers: Record<string, { correct: boolean; explanation?: string }> = {};

  for (const q of assessment.questions) {
    maxScore += q.points;
    const userAnswer = answers?.[q.id];

    let correct = false;
    if (q.type === "MSQ") {
      const expected = JSON.parse(q.answer) as string[];
      const got      = Array.isArray(userAnswer) ? userAnswer : [];
      correct = JSON.stringify([...expected].sort()) === JSON.stringify([...got].sort());
    } else {
      correct =
        String(userAnswer ?? "").toLowerCase().trim() ===
        String(q.answer).toLowerCase().trim();
    }

    if (correct) {
      score += q.points;
    } else if (assessment.negMark > 0) {
      score -= assessment.negMark * q.points;
    }

    gradedAnswers[q.id] = {
      correct,
      explanation: q.explanation ?? undefined,
    };
  }

  score = Math.max(0, score);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const passed     = percentage >= assessment.passMark;

  const attempt = await prisma.examAttempt.create({
    data: {
      userId:       session.user.id,
      assessmentId: params.assessmentId,
      answers:      answers ?? {},
      score:        percentage,
      maxScore:     100,
      passed,
      startedAt:    startedAt ? new Date(startedAt) : new Date(),
      completedAt:  new Date(),
    },
  });

  // Award XP
  await awardXP(
    session.user.id,
    passed ? "quiz_pass" : "quiz_fail",
    { assessmentId: params.assessmentId }
  );

  // Issue certificate if final exam passed
  let certificate: { certificateId: string; pdfUrl: string } | null = null;
  if (assessment.type === "CERTIFICATION_EXAM" && passed) {
    const cert = await prisma.certification.findFirst({
      where: { assessments: { some: { id: params.assessmentId } } },
    });
    if (cert) {
      const { issueCertificate } = await import("@/lib/services/certificate.service");
      certificate = await issueCertificate(session.user.id, cert.id, percentage);
    }
  }

  return NextResponse.json({
    data: {
      attempt,
      score: percentage,
      passed,
      passMark:      assessment.passMark,
      gradedAnswers,
      certificate,
    },
  });
}
