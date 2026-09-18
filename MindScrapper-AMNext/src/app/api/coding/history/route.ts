// src/app/api/coding/history/route.ts

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    where: {
      userId: session.user.id,
    },

    include: {
      problem: {
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 50,
  });

  return NextResponse.json({
    data: submissions,
  });
}
