// src/app/(instructor)/instructor/dashboard/page.tsx
import { redirect }      from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma }        from "@/lib/prisma";
import Link              from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge }  from "@/components/ui/badge";
import { PlusCircle, BookOpen, Users, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Instructor Dashboard" };

export default async function InstructorDashboardPage() {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const certs = await prisma.certification.findMany({
    where:   { instructorId: session.user.id },
    include: { _count: { select: { enrollments: true, chapters: true } } },
    orderBy: { createdAt: "desc" },
  });

  const submissions = await prisma.instructorSubmission.findMany({
    where:   { instructorId: session.user.id },
    orderBy: { createdAt: "desc" },
    take:    5,
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your courses and content</p>
        </div>
        <Button asChild variant="gradient" className="gap-2">
          <Link href="/instructor/create"><PlusCircle className="w-4 h-4" /> New Course</Link>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Courses",  value: certs.length,                              icon: BookOpen, color: "text-blue-400"   },
          { label: "Total Students", value: certs.reduce((a, c) => a + c._count.enrollments, 0), icon: Users, color: "text-violet-400" },
          { label: "Published",      value: certs.filter(c => c.status === "PUBLISHED").length, icon: CheckCircle2, color: "text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>My Certifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {certs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't created any courses yet</p>
              <Button asChild variant="gradient" size="sm"><Link href="/instructor/create">Create your first course</Link></Button>
            </div>
          ) : certs.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c._count.enrollments} students · {c._count.chapters} chapters · Created {formatDate(c.createdAt)}</p>
              </div>
              <Badge variant={
                c.status === "PUBLISHED"      ? "success"     :
                c.status === "PENDING_REVIEW" ? "warning"     :
                c.status === "REJECTED"       ? "destructive" : "secondary"
              } className="shrink-0 text-[10px]">
                {c.status.replace("_", " ")}
              </Badge>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/instructor/${c.id}/edit`}>Edit</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

