import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList } from "lucide-react";

import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";
import { CourseCatalog } from "@/components/landing/course-catalog";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Courses",
  description: "Explore hands-on courses and earn verifiable certifications.",
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.certification.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { chapters: true, assessments: true } },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              Learn with intention
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Courses built to move your work forward.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Follow a clear path from fundamentals to applied practice, then prove what you know with a verifiable certificate.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-20 text-center">
              <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Courses are coming soon</h2>
              <p className="mt-2 text-muted-foreground">Check back shortly for the latest learning paths.</p>
            </div>
          ) : (
            <CourseCatalog courses={courses.map((course) => ({
              id: course.id,
              title: course.title,
              description: course.description,
              category: course.category,
              difficulty: course.difficulty,
              duration: course.duration,
              price: Number(course.price),
              thumbnail: course.thumbnail,
              chapters: course._count.chapters,
              assessments: course._count.assessments,
            }))} />
          )}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
