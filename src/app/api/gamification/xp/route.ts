// src/app/api/gamification/xp/route.ts
// POST — award XP for an action (called client-side after events)
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession }            from "@/lib/auth";
import { awardXP }                   from "@/lib/services/gamification.service";
import { XP_REWARDS }                from "@/config/constants";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reason, meta } = await req.json();
  if (!reason || !(reason in XP_REWARDS))
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });

  // Idempotency: chapter_read only once per chapter
  if (reason === "chapter_read" && meta?.chapterId) {
    const { prisma } = await import("@/lib/prisma");
    const already = await prisma.xPTransaction.findFirst({
      where: {
        userId: session.user.id,
        reason: "chapter_read",
        metadata: { path: ["chapterId"], equals: meta.chapterId },
      },
    });
    if (already) return NextResponse.json({ skipped: true });
  }

  const result = await awardXP(session.user.id, reason, meta);
  return NextResponse.json({ data: result });
}

export async function GET() {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prisma } = await import("@/lib/prisma");
  const profile    = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json({ data: profile });
}

