// ─────────────────────────────────────────────────────────────
//  src/app/api/profile/route.ts
//  GET  /api/profile  — current user's profile + stats
//  PATCH /api/profile — update name / bio
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET() {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, profile, certCount, solvedProblems] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
    }),
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.certificate.count({ where: { userId: session.user.id } }),
    prisma.submission.count({ where: { userId: session.user.id, status: "ACCEPTED" } }),
  ]);

  return NextResponse.json({
    data: { user, profile, stats: { certCount, solvedProblems } },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, bio } = await req.json();

  await Promise.all([
    name
      ? prisma.user.update({ where: { id: session.user.id }, data: { name } })
      : Promise.resolve(),
    prisma.profile.update({ where: { userId: session.user.id }, data: { bio: bio ?? undefined } }),
  ]);

  return NextResponse.json({ message: "Profile updated" });
}

