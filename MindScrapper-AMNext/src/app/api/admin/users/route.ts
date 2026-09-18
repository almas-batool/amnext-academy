// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const search = req.nextUrl.searchParams.get("search") ?? "";
  const role   = req.nextUrl.searchParams.get("role");
  const page   = parseInt(req.nextUrl.searchParams.get("page") ?? "1");

  const where: any = {};
  if (role)   where.role = role;
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id:            true,
        name:          true,
        email:         true,
        role:          true,
        emailVerified: true,
        createdAt:     true,
        profile:       { select: { xp: true, streak: true, level: true } },
        _count:        { select: { enrollments: true, certificates: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * 20,
      take:    20,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ data: users, total, page });
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, role } = await req.json();
  if (!userId || !role)
    return NextResponse.json({ error: "userId and role required" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: userId },
    data:  { role },
  });

  return NextResponse.json({ data: user });
}
