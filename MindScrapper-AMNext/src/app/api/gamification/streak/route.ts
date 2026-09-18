// src/app/api/gamification/streak/route.ts
import { NextResponse }   from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET() {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where:  { userId: session.user.id },
    select: { streak: true, lastActive: true },
  });

  return NextResponse.json({ data: profile });
}

export async function POST() {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { updateStreak } = await import("@/lib/services/gamification.service");
  const newStreak        = await updateStreak(session.user.id);

  return NextResponse.json({ data: { streak: newStreak } });
}
