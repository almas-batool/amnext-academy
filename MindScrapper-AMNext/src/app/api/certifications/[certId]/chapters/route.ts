// src/app/api/certifications/[certId]/chapters/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { certId: string } }
) {
  const chapters = await prisma.chapter.findMany({
    where:   { certId: params.certId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json({ data: chapters });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { certId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cert = await prisma.certification.findUnique({ where: { id: params.certId } });
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (cert.instructorId !== session.user.id && session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body    = await req.json();
  const chapter = await prisma.chapter.create({
    data: { ...body, certId: params.certId },
  });

  await prisma.certification.update({
    where: { id: params.certId },
    data:  { totalChapters: { increment: 1 } },
  });

  return NextResponse.json({ data: chapter }, { status: 201 });
}
