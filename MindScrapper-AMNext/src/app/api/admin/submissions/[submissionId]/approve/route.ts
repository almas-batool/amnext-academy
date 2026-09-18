// src/app/api/admin/submissions/[submissionId]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { note } = await req.json().catch(() => ({ note: "" }));

  const sub = await prisma.instructorSubmission.findUnique({
    where: { id: params.submissionId },
  });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.instructorSubmission.update({
      where: { id: params.submissionId },
      data:  { status: "APPROVED", adminNote: note, reviewedAt: new Date(), reviewedBy: session.user.id },
    }),
    prisma.certification.update({
      where: { id: sub.certId },
      data:  { status: "PUBLISHED" },
    }),
  ]);

  return NextResponse.json({ message: "Approved and published" });
}
