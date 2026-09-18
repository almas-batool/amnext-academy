// src/app/api/admin/submissions/route.ts
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET() {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const submissions = await prisma.instructorSubmission.findMany({
    include: {
      instructor: { select: { name: true, email: true } },
      cert:       { select: { title: true, category: true, difficulty: true } },
    },
    orderBy: { createdAt: "desc" },
    take:    50,
  });

  return NextResponse.json({ data: submissions });
}
