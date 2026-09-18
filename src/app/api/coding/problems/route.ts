// src/app/api/coding/problems/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session    = await getAuthSession();
  const { searchParams } = req.nextUrl;
  const difficulty = searchParams.get("difficulty");
  const search     = searchParams.get("search") ?? "";
  const certId     = searchParams.get("certId");
  const page       = parseInt(searchParams.get("page") ?? "1");
  const pageSize   = parseInt(searchParams.get("pageSize") ?? "20");

  const where: any = {};
  if (difficulty)       where.difficulty = difficulty;
  if (certId)           where.certId     = certId;
  if (search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { tags:  { has: search } },
    ];
  }

  const [problems, total] = await Promise.all([
    prisma.codingProblem.findMany({
      where,
      select: {
        id:         true,
        title:      true,
        slug:       true,
        difficulty: true,
        tags:       true,
        _count:     { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    prisma.codingProblem.count({ where }),
  ]);

  // Mark solved problems for logged-in user
  let solvedIds: string[] = [];
  if (session?.user?.id) {
    const solved = await prisma.submission.findMany({
      where:  { userId: session.user.id, status: "ACCEPTED" },
      select: { problemId: true },
    });
    solvedIds = [...new Set(solved.map((s) => s.problemId))];
  }

  return NextResponse.json({
    items:    problems.map((p) => ({ ...p, solved: solvedIds.includes(p.id) })),
    total,
    page,
    pageSize,
    hasMore:  total > page * pageSize,
  });
}

