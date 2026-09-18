// src/app/(dashboard)/certificates/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, ExternalLink, Share2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My Certificates" };

export default async function CertificatesPage() {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const certificates = await prisma.certificate.findMany({
    where:   { userId: session.user.id },
    include: { cert: { select: { title: true, category: true, difficulty: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <p className="text-muted-foreground mt-1">{certificates.length} earned</p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-24">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h2 className="text-xl font-semibold mb-2">No certificates yet</h2>
          <p className="text-muted-foreground mb-6">Complete a certification exam to earn your first certificate</p>
          <Button asChild variant="gradient">
            <Link href="/certifications">Browse Certifications</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              {/* Certificate preview */}
              <div className="bg-gradient-to-br from-violet-900 via-indigo-900 to-blue-900 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400/40 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-amber-400" />
                </div>
                <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Certificate of Completion</p>
                <p className="text-white font-bold text-lg">{c.cert.title}</p>
                {c.score && (
                  <p className="text-amber-400 text-sm mt-1">Score: {c.score.toFixed(1)}%</p>
                )}
              </div>

              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Certificate ID</span>
                  <span className="font-mono font-medium text-xs">{c.certificateId}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Issued</span>
                  <span className="font-medium">{formatDate(c.issuedAt)}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5">
                    <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5">
                    <Link href={`/verify/${c.certificateId}`}>
                      <ExternalLink className="w-3.5 h-3.5" /> Verify
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

