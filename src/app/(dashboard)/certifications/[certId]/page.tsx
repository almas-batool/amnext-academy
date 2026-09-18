// ─────────────────────────────────────────────────────────────
//  src/app/(dashboard)/certifications/[certId]/page.tsx
//  Certification overview / detail page.
// ─────────────────────────────────────────────────────────────
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Clock,
  Users,
  CheckCircle2,
  Code2,
  ClipboardList,
  Award,
  Play,
  Lock,
} from "lucide-react";
import { EnrollButton } from "@/components/certification/enroll-button";

export async function generateMetadata({
  params,
}: {
  params: { certId: string };
}) {
  try {
    const cert = await prisma.certification.findUnique({
      where: { id: params.certId },
      select: { title: true },
    });

    return {
      title: cert?.title ?? "Certification",
    };
  } catch (error) {
    console.error("Metadata error:", error);

    return {
      title: "Certification",
    };
  }
}

export default async function CertDetailPage({
  params,
}: {
  params: { certId: string };
}) {
  const session = await getAuthSession();

  const cert = await prisma.certification.findUnique({
    where: { id: params.certId },
    include: {
      instructor: { select: { name: true, image: true } },
      chapters: { orderBy: { order: "asc" } },
      assessments: { include: { _count: { select: { questions: true } } } },
      codingProblems: { select: { id: true, title: true, difficulty: true } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!cert || cert.status !== "PUBLISHED") notFound();

  const enrollment = session?.user?.id
    ? await prisma.enrollment.findUnique({
        where: {
          userId_certId: { userId: session.user.id, certId: params.certId },
        },
      })
    : null;

  const isEnrolled = !!enrollment;
  const outcomes = Array.isArray(cert.learningOutcomes)
    ? (cert.learningOutcomes as string[])
    : [];
  const prereqs = Array.isArray(cert.prerequisites)
    ? (cert.prerequisites as string[])
    : [];

  return (
    <div className="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero */}
          <div>
            <div className="flex gap-2 mb-3 flex-wrap">
              <Badge variant="secondary">{cert.category}</Badge>
              <Badge
                variant={
                  cert.difficulty === "BEGINNER"
                    ? "success"
                    : cert.difficulty === "INTERMEDIATE"
                      ? "warning"
                      : "destructive"
                }
              >
                {cert.difficulty}
              </Badge>
              {cert.tags.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl font-bold mb-4">{cert.title}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {cert.description}
            </p>

            <div className="flex flex-wrap gap-6 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />{" "}
                {cert._count.enrollments.toLocaleString()} enrolled
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> {cert.chapters.length} chapters
              </span>
              {cert.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> ~{cert.duration} hours
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4" /> {cert.codingProblems.length}{" "}
                coding problems
              </span>
            </div>
          </div>

          <Separator />

          {/* Learning outcomes */}
          {outcomes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">What you'll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {outcomes.map((o, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{o}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chapters */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Course Chapters</h2>
            <div className="space-y-2">
              {cert.chapters.map((ch, i) => (
                <div
                  key={ch.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                    {i + 1}
                  </div>
                  <span className="flex-1 text-sm font-medium">{ch.title}</span>
                  {isEnrolled ? (
                    <Link
                      href={`/certifications/${cert.id}/learn?chapter=${ch.id}`}
                    >
                      <Play className="w-4 h-4 text-primary" />
                    </Link>
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Assessments */}
          {cert.assessments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Assessments & Exam</h2>
              <div className="space-y-3">
                {cert.assessments.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="py-4 flex items-center gap-3">
                      <ClipboardList className="w-5 h-5 text-violet-400 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{a.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {a._count.questions} questions ·
                          {a.timeLimit ? ` ${a.timeLimit} min · ` : " "}
                          Pass: {a.passMark}%
                        </p>
                      </div>
                      <Badge
                        variant={
                          a.type === "CERTIFICATION_EXAM"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {a.type === "CERTIFICATION_EXAM"
                          ? "Final Exam"
                          : "Quiz"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {prereqs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Prerequisites</h2>
              <ul className="space-y-1.5">
                {prereqs.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar — Enrollment Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              {cert.thumbnail && (
                <img
                  src={cert.thumbnail}
                  alt={cert.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <CardContent className="pt-6 space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {Number(cert.price) === 0 ? (
                      <span className="text-emerald-400">Free</span>
                    ) : (
                      formatCurrency(Number(cert.price), cert.currency)
                    )}
                  </div>
                  {cert.currency === "USD" && Number(cert.price) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      incl. GST
                    </p>
                  )}
                </div>

                {isEnrolled ? (
                  <Button
                    asChild
                    className="w-full"
                    variant="gradient"
                    size="lg"
                  >
                    <Link href={`/certifications/${cert.id}/learn`}>
                      <Play className="w-4 h-4 mr-2" /> Continue Learning
                    </Link>
                  </Button>
                ) : (
                  <EnrollButton
                    certId={cert.id}
                    price={Number(cert.price)}
                    currency={cert.currency}
                    certTitle={cert.title}
                    isLoggedIn={!!session}
                  />
                )}

                <div className="space-y-3 text-sm">
                  {[
                    {
                      icon: BookOpen,
                      label: `${cert.chapters.length} chapters`,
                    },
                    {
                      icon: Code2,
                      label: `${cert.codingProblems.length} coding problems`,
                    },
                    {
                      icon: ClipboardList,
                      label: `${cert.assessments.length} assessments`,
                    },
                    {
                      icon: Award,
                      label: "Verifiable certificate on completion",
                    },
                    { icon: Clock, label: "Lifetime access" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
