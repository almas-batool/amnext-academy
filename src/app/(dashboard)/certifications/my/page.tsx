// src/app/(dashboard)/certifications/my/page.tsx
import { redirect }      from "next/navigation";
import Link              from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button }    from "@/components/ui/button";
import { Progress }  from "@/components/ui/progress";
import { BookOpen, Play, Award } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My Certifications" };

export default async function MyCertificationsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const enrollments = await prisma.enrollment.findMany({
    where:   { userId: session.user.id },
    include: {
      cert: {
        include: {
          assessments: { where: { type: "CERTIFICATION_EXAM" }, select: { id: true } },
          _count:      { select: { chapters: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const certIds      = enrollments.map((e) => e.certId);
  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id, certId: { in: certIds } },
  });

  const active    = enrollments.filter((e) => !e.completedAt);
  const completed = enrollments.filter((e) => !!e.completedAt);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Certifications</h1>
        <p className="text-muted-foreground mt-1">
          {active.length} in progress · {completed.length} completed
        </p>
      </div>

      {enrollments.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <BookOpen className="w-14 h-14 text-muted-foreground mx-auto opacity-40" />
          <h2 className="text-xl font-semibold">No certifications yet</h2>
          <p className="text-muted-foreground">Browse our catalog to get started</p>
          <Button asChild variant="gradient">
            <Link href="/certifications">Browse Certifications</Link>
          </Button>
        </div>
      )}

      {active.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">In Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((e) => {
              const pct     = Math.round(e.progress * 100);
              const hasExam = e.cert.assessments.length > 0;
              return (
                <Card key={e.id} className="hover:border-primary/40 transition-colors">
                  <CardContent className="pt-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium line-clamp-1">{e.cert.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Enrolled {formatDate(e.enrolledAt)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{pct}% complete</span>
                        <span>{e.cert._count.chapters} chapters</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="gradient" size="sm" className="flex-1 gap-1.5">
                        <Link href={`/certifications/${e.certId}/learn`}>
                          <Play className="w-3.5 h-3.5" /> Continue
                        </Link>
                      </Button>
                      {hasExam && (
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                          <Link href={`/certifications/${e.certId}/exam`}>
                            <Award className="w-3.5 h-3.5" /> Exam
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Completed</h2>
          <div className="space-y-3">
            {completed.map((e) => {
              const cert = certificates.find((c) => c.certId === e.certId);
              return (
                <Card key={e.id} className="border-emerald-500/20">
                  <CardContent className="py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{e.cert.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed {e.completedAt ? formatDate(e.completedAt) : ""}
                      </p>
                    </div>
                    {cert && (
                      <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
                        <Link href={`/verify/${cert.certificateId}`}>
                          <Award className="w-3.5 h-3.5" /> Certificate
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

