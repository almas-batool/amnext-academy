// src/app/api/certificates/[certId]/route.ts
// Public endpoint — no auth required — for cert verification
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { certId: string } }
) {
  const cert = await prisma.certificate.findUnique({
    where:   { certificateId: params.certId },
    include: {
      user: { select: { name: true, email: true } },
      cert: { select: { title: true, category: true, difficulty: true } },
    },
  });

  if (!cert) return NextResponse.json({ valid: false, error: "Certificate not found" }, { status: 404 });

  return NextResponse.json({
    valid: true,
    data: {
      certificateId:      cert.certificateId,
      studentName:        cert.user.name ?? cert.user.email,
      certificationTitle: cert.cert.title,
      category:           cert.cert.category,
      difficulty:         cert.cert.difficulty,
      issuedAt:           cert.issuedAt,
      score:              cert.score,
      pdfUrl:             cert.pdfUrl,
    },
  });
}
