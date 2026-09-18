//src/app/api/admin/chapters/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { chapterSchema } from "@/lib/validators/chapter";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const parsed = chapterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const certification = await prisma.certification.findUnique({
      where: {
        id: data.certId,
      },
    });

    if (!certification) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 },
      );
    }

    const chapter = await prisma.chapter.create({
      data: {
        certId: data.certId,
        title: data.title,
        order: data.order,
        content: data.description,
      },
    });

    await prisma.certification.update({
      where: {
        id: data.certId,
      },
      data: {
        totalChapters: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
