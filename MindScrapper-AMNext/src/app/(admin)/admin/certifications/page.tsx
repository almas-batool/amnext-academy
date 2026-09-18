// ─────────────────────────────────────────────────────────────
//  src/app/(admin)/admin/certifications/page.tsx
//  Admin view of all certifications across all instructors.
// ─────────────────────────────────────────────────────────────
import { prisma } from "@/lib/prisma";
import Link       from "next/link";
import { Badge }  from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookOpen, Users } from "lucide-react";

export const metadata = { title: "All Certifications" };

export default async function AdminCertificationsPage() {
  const certs = await prisma.certification.findMany({
    include: {
      instructor: { select: { name: true, email: true } },
      _count:     { select: { enrollments: true, chapters: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const grouped = {
    PUBLISHED:      certs.filter((c) => c.status === "PUBLISHED"),
    PENDING_REVIEW: certs.filter((c) => c.status === "PENDING_REVIEW"),
    DRAFT:          certs.filter((c) => c.status === "DRAFT"),
    REJECTED:       certs.filter((c) => c.status === "REJECTED"),
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Certifications</h1>
        <p className="text-muted-foreground mt-1">{certs.length} total across the platform</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(grouped).map(([status, list]) => (
          <Card key={status}>
            <CardContent className="pt-5">
              <p className="text-2xl font-bold">{list.length}</p>
              <p className="text-xs text-muted-foreground capitalize">{status.replace("_", " ").toLowerCase()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Instructor</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Students</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link href={`/certifications/${c.id}`} className="font-medium hover:text-primary transition-colors">
                    {c.title}
                  </Link>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <BookOpen className="w-3 h-3" /> {c._count.chapters} chapters
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm">{c.instructor.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{c.instructor.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                </td>
                <td className="px-4 py-3 font-medium">
                  {Number(c.price) === 0 ? "Free" : formatCurrency(Number(c.price), c.currency)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {c._count.enrollments}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={
                    c.status === "PUBLISHED"      ? "success"     :
                    c.status === "PENDING_REVIEW" ? "warning"     :
                    c.status === "REJECTED"       ? "destructive" : "secondary"
                  } className="text-[10px]">
                    {c.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
