// ─────────────────────────────────────────────────────────────
//  src/app/api/certifications/route.ts
//  GET  /api/certifications  — paginated public list
//  POST /api/certifications  — create (INSTRUCTOR / ADMIN)
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import { slugify }        from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category   = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const search     = searchParams.get("search") ?? "";
  const page       = parseInt(searchParams.get("page")     ?? "1");
  const pageSize   = parseInt(searchParams.get("pageSize") ?? "12");

  const where: any = { status: "PUBLISHED" };
  if (category)           where.category   = category;
  if (difficulty)         where.difficulty = difficulty;
  if (search.trim()) {
    where.OR = [
      { title:       { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags:        { has: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.certification.findMany({
      where,
      include: {
        instructor: { select: { name: true, image: true } },
        _count:     { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    prisma.certification.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize, hasMore: total > page * pageSize });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !["INSTRUCTOR", "ADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, ...rest } = body;

  if (!title?.trim())
    return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const baseSlug = slugify(title);
  const exists   = await prisma.certification.findUnique({ where: { slug: baseSlug } });
  const slug     = exists ? `${baseSlug}-${Date.now()}` : baseSlug;

  const cert = await prisma.certification.create({
    data: {
      ...rest,
      title,
      slug,
      instructorId: session.user.id,
      status:       session.user.role === "ADMIN" ? "PUBLISHED" : "DRAFT",
    },
  });

  // Create instructor submission for admin review
  if (session.user.role === "INSTRUCTOR") {
    await prisma.instructorSubmission.create({
      data: { instructorId: session.user.id, certId: cert.id },
    });
  }

  return NextResponse.json({ data: cert }, { status: 201 });
}

