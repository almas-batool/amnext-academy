// src/app/api/certifications/[certId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: { certId: string } };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getAuthSession();

  const cert = await prisma.certification.findUnique({
    where: { id: params.certId },
    include: {
      instructor:    { select: { name: true, image: true, email: true } },
      chapters:      { orderBy: { order: "asc" } },
      assessments:   { include: { _count: { select: { questions: true } } } },
      codingProblems:{ orderBy: { difficulty: "asc" } },
      _count:        { select: { enrollments: true } },
    },
  });

  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let enrollment = null;
  if (session?.user?.id) {
    enrollment = await prisma.enrollment.findUnique({
      where: { userId_certId: { userId: session.user.id, certId: params.certId } },
    });
  }

  return NextResponse.json({ data: { ...cert, enrollment } });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cert = await prisma.certification.findUnique({ where: { id: params.certId } });
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (cert.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body    = await req.json();
  const updated = await prisma.certification.update({
    where: { id: params.certId },
    data:  body,
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cert = await prisma.certification.findUnique({ where: { id: params.certId } });
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (cert.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.certification.update({
    where: { id: params.certId },
    data:  { status: "DRAFT" },
  });

  return NextResponse.json({ message: "Certification unpublished" });
}
