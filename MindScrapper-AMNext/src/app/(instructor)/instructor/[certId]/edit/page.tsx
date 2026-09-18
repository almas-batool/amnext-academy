// ─────────────────────────────────────────────────────────────
//  src/app/(instructor)/instructor/[certId]/edit/page.tsx
//  Instructor course editor — manage chapters, basic info,
//  view assessments and coding problems.
// ─────────────────────────────────────────────────────────────
import { redirect, notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import { CourseEditorClient } from "@/components/instructor/course-editor-client";

export async function generateMetadata({ params }: { params: { certId: string } }) {
  const cert = await prisma.certification.findUnique({ where: { id: params.certId } });
  return { title: `Edit: ${cert?.title ?? "Course"}` };
}

export default async function EditCoursePage({ params }: { params: { certId: string } }) {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const cert = await prisma.certification.findUnique({
    where:   { id: params.certId },
    include: {
      chapters:       { orderBy: { order: "asc" } },
      assessments:    { include: { _count: { select: { questions: true } } } },
      codingProblems: true,
    },
  });

  if (!cert) notFound();
  if (cert.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/instructor/dashboard");
  }

  return <CourseEditorClient cert={cert as any} />;
}
