// ─────────────────────────────────────────────────────────────
//  src/app/verify/[certId]/page.tsx
//  Public certificate verification — no auth required.
// ─────────────────────────────────────────────────────────────
import { notFound } from "next/navigation";
import { prisma }   from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, XCircle, Award, Calendar, User, BookOpen, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: { certId: string } }) {
  return { title: `Certificate Verification — ${params.certId}` };
}

export default async function VerifyPage({
  params,
}: {
  params: { certId: string };
}) {
  const certificate = await prisma.certificate.findUnique({
    where:   { certificateId: params.certId },
    include: {
      user: { select: { name: true, email: true } },
      cert: { select: { title: true, category: true, difficulty: true } },
    },
  });

  const valid = !!certificate;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">AMNext Academy Certificate Verification</p>
        </div>

        {/* Result card */}
        <div className={`rounded-2xl border p-8 text-center ${
          valid
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-red-500/40 bg-red-500/5"
        }`}>
          {valid ? (
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold mb-2">
            {valid ? "Certificate Verified ✓" : "Certificate Not Found"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {valid
              ? "This is a valid, authentic AMNext Academy certificate."
              : "No certificate found with this ID. It may be invalid or revoked."}
          </p>
        </div>

        {/* Details */}
        {valid && certificate && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Certificate Details</h2>
            {[
              {
                icon: User,
                label: "Student Name",
                value: certificate.user.name ?? certificate.user.email,
              },
              {
                icon: BookOpen,
                label: "Certification",
                value: certificate.cert.title,
              },
              {
                icon: Calendar,
                label: "Date Issued",
                value: formatDate(certificate.issuedAt),
              },
              {
                icon: Award,
                label: "Certificate ID",
                value: certificate.certificateId,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm shrink-0">
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
                <span className="text-sm font-medium text-right">{value}</span>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <Badge
                  variant={
                    certificate.cert.difficulty === "BEGINNER"
                      ? "success"
                      : certificate.cert.difficulty === "INTERMEDIATE"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {certificate.cert.difficulty}
                </Badge>
                <Badge variant="secondary">{certificate.cert.category}</Badge>
              </div>
              {certificate.score && (
                <span className="text-sm text-emerald-400 font-medium">
                  Score: {certificate.score.toFixed(1)}%
                </span>
              )}
            </div>

            <Button asChild variant="outline" className="w-full gap-2" size="sm">
              <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4" /> Download Certificate
              </a>
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Verify more certificates at{" "}
          <a href="/verify" className="text-primary hover:underline">
            AMNext Academy.dev/verify
          </a>
        </p>
      </div>
    </div>
  );
}
