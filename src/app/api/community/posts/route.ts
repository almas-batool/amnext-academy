// ─────────────────────────────────────────────────────────────
//  src/app/api/community/posts/route.ts
//  GET  — paginated post list with filters
//  POST — create a new post
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const certId  = searchParams.get("certId");
  const tag     = searchParams.get("tag");
  const search  = searchParams.get("search") ?? "";
  const sort    = searchParams.get("sort") ?? "latest";
  const page    = parseInt(searchParams.get("page") ?? "1");

  const where: any = {};
  if (certId) where.certId = certId;
  if (tag)    where.tags   = { has: tag };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { body:  { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: any =
    sort === "top" ? { upvotes: "desc" } : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.communityPost.findMany({
      where,
      include: {
        user:   { select: { name: true, image: true } },
        _count: { select: { replies: true } },
      },
      orderBy,
      skip:  (page - 1) * 20,
      take:  20,
    }),
    prisma.communityPost.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, hasMore: total > page * 20 });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body, tags, certId } = await req.json();

  if (!title?.trim() || !body?.trim())
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });

  const post = await prisma.communityPost.create({
    data: {
      userId: session.user.id,
      title:  title.trim(),
      body:   body.trim(),
      tags:   Array.isArray(tags) ? tags : [],
      certId: certId ?? null,
    },
    include: { user: { select: { name: true, image: true } } },
  });

  return NextResponse.json({ data: post }, { status: 201 });
}

