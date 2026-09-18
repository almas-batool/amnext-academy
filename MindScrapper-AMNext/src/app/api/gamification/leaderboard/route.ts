// src/app/api/gamification/leaderboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") ?? "all";

  if (period === "all") {
    const leaders = await prisma.profile.findMany({
      orderBy: { xp: "desc" },
      take:    50,
      include: { user: { select: { name: true, image: true } } },
    });
    return NextResponse.json({ data: leaders.map((l, i) => ({ ...l, rank: i + 1 })) });
  }

  const now   = new Date();
  const since =
    period === "weekly"
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date(now.getFullYear(), now.getMonth(), 1);

  const xpByUser = await prisma.xPTransaction.groupBy({
    by:      ["userId"],
    where:   { createdAt: { gte: since } },
    _sum:    { points: true },
    orderBy: { _sum: { points: "desc" } },
    take:    50,
  });

  const userIds = xpByUser.map((x) => x.userId);
  const users   = await prisma.user.findMany({
    where:  { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });

  const data = xpByUser.map((x, i) => ({
    rank:   i + 1,
    userId: x.userId,
    xp:     x._sum.points ?? 0,
    user:   users.find((u) => u.id === x.userId),
  }));

  return NextResponse.json({ data });
}
