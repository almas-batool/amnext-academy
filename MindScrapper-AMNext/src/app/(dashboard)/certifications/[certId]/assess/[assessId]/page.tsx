// ─────────────────────────────────────────────────────────────
//  src/app/(dashboard)/certifications/[certId]/assess/[assessId]/page.tsx
//  Quiz/practice assessment page (not the final cert exam).
// ─────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import { AssessmentClient } from "@/components/assessment/assessment-client";

export async function generateMetadata({
  params,
}: {
  params: { certId: string; assessId: string };
}) {
  const a = await prisma.assessment.findUnique({ where: { id: params.assessId } });
  return { title: a?.title ?? "Assessment" };
}

export default async function AssessPage({
  params,
}: {
  params: { certId: string; assessId: string };
}) {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_certId: { userId: session.user.id, certId: params.certId } },
  });
  if (!enrollment) redirect(`/certifications/${params.certId}`);

  const assessment = await prisma.assessment.findUnique({
    where:   { id: params.assessId },
    include: { _count: { select: { questions: true } } },
  });
  if (!assessment) redirect(`/certifications/${params.certId}/learn`);

  // Get past attempts
  const attempts = await prisma.examAttempt.findMany({
    where:   { userId: session.user.id, assessmentId: params.assessId },
    orderBy: { completedAt: "desc" },
    take:    5,
  });

  return (
    <AssessmentClient
      assessmentId={params.assessId}
      certId={params.certId}
      title={assessment.title}
      type={assessment.type}
      passMark={assessment.passMark}
      timeLimit={assessment.timeLimit}
      questionCount={assessment._count.questions}
      maxAttempts={assessment.maxAttempts}
      attempts={attempts as any}
    />
  );
}
