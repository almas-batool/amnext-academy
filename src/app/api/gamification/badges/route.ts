// src/app/api/gamification/badges/route.ts
import { NextResponse }   from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import { BADGES }         from "@/config/constants";

export async function GET() {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where:  { userId: session.user.id },
    select: { badges: true },
  });

  const earned: string[] = Array.isArray(profile?.badges) ? (profile.badges as string[]) : [];

  const data = BADGES.map((b) => ({
    ...b,
    earned: earned.includes(b.id),
  }));

  return NextResponse.json({ data });
}

