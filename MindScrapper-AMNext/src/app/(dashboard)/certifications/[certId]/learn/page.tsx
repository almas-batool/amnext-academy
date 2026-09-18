// ─────────────────────────────────────────────────────────────
//  src/app/(dashboard)/certifications/[certId]/learn/page.tsx
//  Three-panel learning workspace: PDF | Notes | Code Editor
// ─────────────────────────────────────────────────────────────
import { redirect, notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceClient } from "@/components/workspace/workspace-client";

export const metadata = { title: "Learning Workspace" };

export default async function LearnPage({
  params,
  searchParams,
}: {
  params:       { certId: string };
  searchParams: { chapter?: string };
}) {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  // Must be enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_certId: { userId: session.user.id, certId: params.certId } },
  });
  if (!enrollment) redirect(`/certifications/${params.certId}`);

  const cert = await prisma.certification.findUnique({
    where:   { id: params.certId },
    include: {
      chapters:       { orderBy: { order: "asc" } },
      codingProblems: { orderBy: { difficulty: "asc" }, take: 1 },
      assessments:    {
        select: {
          id: true, title: true, type: true, passMark: true,
          timeLimit: true, maxAttempts: true,
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!cert) notFound();

  // Fetch the student's latest attempt for each assessment (for status display)
  const attempts = await prisma.examAttempt.findMany({
    where:   { userId: session.user.id, assessmentId: { in: cert.assessments.map((a) => a.id) } },
    orderBy: { completedAt: "desc" },
  });
  const latestAttempt = new Map<string, typeof attempts[number]>();
  for (const a of attempts) {
    if (!latestAttempt.has(a.assessmentId)) latestAttempt.set(a.assessmentId, a);
  }
  const assessmentsWithStatus = cert.assessments.map((a) => ({
    ...a,
    latestAttempt: latestAttempt.get(a.id)
      ? { score: latestAttempt.get(a.id)!.score, passed: latestAttempt.get(a.id)!.passed }
      : null,
  }));

  const activeChapter =
    (searchParams.chapter
      ? cert.chapters.find((c) => c.id === searchParams.chapter)
      : null) ?? cert.chapters[0] ?? null;

  return (
    <WorkspaceClient
      cert={cert as any}
      chapters={cert.chapters as any}
      activeChapter={activeChapter as any}
      firstProblem={cert.codingProblems[0] ?? null}
      assessments={assessmentsWithStatus as any}
      userId={session.user.id}
    />
  );
}
