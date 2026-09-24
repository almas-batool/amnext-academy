import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BookOpen, CheckCircle2, ChevronLeft, ClipboardList, Clock, Lock, Play, UserRound } from "lucide-react";

import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";
import { EnrollButton } from "@/components/certification/enroll-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { courseId: string } }) {
  const course = await prisma.certification.findUnique({ where: { id: params.courseId }, select: { title: true } });
  return { title: course?.title ?? "Course" };
}

export default async function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const session = await getAuthSession();
  const course = await prisma.certification.findUnique({
    where: { id: params.courseId },
    include: {
      instructor: { select: { name: true, image: true } },
      chapters: { orderBy: { order: "asc" } },
      assessments: { include: { _count: { select: { questions: true } } } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course || course.status !== "PUBLISHED") notFound();

  const enrollment = session?.user?.id
    ? await prisma.enrollment.findUnique({ where: { userId_certId: { userId: session.user.id, certId: course.id } } })
    : null;
  const outcomes = Array.isArray(course.learningOutcomes) ? course.learningOutcomes as string[] : [];
  const prerequisites = Array.isArray(course.prerequisites) ? course.prerequisites as string[] : [];
  const skills = course.tags;

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main className="px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/courses" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" />All courses</Link>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-10">
              <header>
                <div className="mb-4 flex flex-wrap gap-2"><Badge variant="secondary">{course.category}</Badge><Badge variant={course.difficulty === "BEGINNER" ? "success" : course.difficulty === "INTERMEDIATE" ? "warning" : "destructive"}>{course.difficulty}</Badge></div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{course.title}</h1>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{course.longDescription || course.description}</p>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                  {course.instructor?.name && <span className="flex items-center gap-2"><UserRound className="h-4 w-4" />{course.instructor.name}</span>}
                  <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" />{course.chapters.length} chapters</span>
                  {course.duration && <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{course.duration} hours</span>}
                  <span className="flex items-center gap-2"><Award className="h-4 w-4" />Certificate included</span>
                </div>
              </header>

              {outcomes.length > 0 && <section><h2 className="mb-4 text-2xl font-semibold">What you'll learn</h2><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{outcomes.map((outcome) => <div key={outcome} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{outcome}</div>)}</div></section>}
              {skills.length > 0 && <section><h2 className="mb-4 text-2xl font-semibold">Skills covered</h2><div className="flex flex-wrap gap-2">{skills.map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}</div></section>}

              <section className="grid gap-6 sm:grid-cols-2"><div><h2 className="mb-3 text-2xl font-semibold">Prerequisites</h2><ul className="space-y-2 text-sm text-muted-foreground">{prerequisites.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{item}</li>)}</ul></div><div><h2 className="mb-3 text-2xl font-semibold">Who this is for</h2><p className="text-sm leading-relaxed text-muted-foreground">{course.targetAudience || "Learners ready to build practical, job-relevant skills."}</p></div></section>

              <section><h2 className="mb-4 text-2xl font-semibold">Course modules</h2><div className="space-y-2">{course.chapters.map((chapter, index) => <div key={chapter.id} className="flex items-center gap-3 rounded-lg border border-border p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">{index + 1}</span><span className="flex-1 text-sm font-medium">{chapter.title}</span>{enrollment ? <Link href={`/certifications/${course.id}/learn?chapter=${chapter.id}`} aria-label={`Open ${chapter.title}`}><Play className="h-4 w-4 text-primary" /></Link> : <Lock className="h-4 w-4 text-muted-foreground" />}</div>)}</div></section>

              <section><h2 className="mb-4 text-2xl font-semibold">Assessments and certification</h2><div className="space-y-3">{course.assessments.length > 0 ? course.assessments.map((assessment) => <Card key={assessment.id}><CardContent className="flex items-center gap-3 py-4"><ClipboardList className="h-5 w-5 shrink-0 text-violet-400" /><div className="flex-1"><p className="font-medium">{assessment.title}</p><p className="text-sm text-muted-foreground">{assessment._count.questions} questions{assessment.timeLimit ? ` · ${assessment.timeLimit} min` : ""} · Pass mark {assessment.passMark}%</p></div><Badge variant={assessment.type === "CERTIFICATION_EXAM" ? "default" : "secondary"}>{assessment.type === "CERTIFICATION_EXAM" ? "Final exam" : "Quiz"}</Badge></CardContent></Card>) : <p className="text-muted-foreground">Assessments will be added to this course soon.</p>}<div className="flex items-start gap-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4"><Award className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" /><div><p className="font-medium">Earn your AMNext certificate</p><p className="mt-1 text-sm text-muted-foreground">Complete the course and pass its certification assessment to receive a verifiable certificate.</p></div></div></div></section>
            </div>

            <aside><div className="sticky top-24 overflow-hidden rounded-xl border border-border bg-card"><div className="h-52 bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-background">{course.thumbnail && <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />}</div><div className="space-y-6 p-6"><div><p className="text-sm text-muted-foreground">One-time enrollment</p><p className="mt-1 text-4xl font-bold">{Number(course.price) === 0 ? <span className="text-emerald-400">Free</span> : formatCurrency(Number(course.price), "USD")}</p></div>{enrollment ? <Button asChild variant="gradient" size="lg" className="w-full"><Link href={`/certifications/${course.id}/learn`}><Play className="mr-2 h-4 w-4" />Continue learning</Link></Button> : <EnrollButton certId={course.id} price={Number(course.price)} currency="USD" certTitle={course.title} isLoggedIn={!!session} />}<Separator /><div className="space-y-3 text-sm text-muted-foreground"><p><BookOpen className="mr-2 inline h-4 w-4" />{course.chapters.length} complete chapters</p><p><ClipboardList className="mr-2 inline h-4 w-4" />{course.assessments.length} assessments</p><p><Award className="mr-2 inline h-4 w-4" />Certificate on completion</p><p><Clock className="mr-2 inline h-4 w-4" />Lifetime access</p></div></div></div></aside>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
