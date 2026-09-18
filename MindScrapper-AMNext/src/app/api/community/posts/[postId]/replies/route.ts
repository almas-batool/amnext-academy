// src/app/api/community/posts/[postId]/replies/route.ts
// GET single post with all replies
// POST add a reply
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const post = await prisma.communityPost.findUnique({
    where:   { id: params.postId },
    include: {
      user:    { select: { name: true, image: true, role: true } },
      replies: {
        include: { user: { select: { name: true, image: true, role: true } } },
        orderBy: [{ accepted: "desc" }, { upvotes: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment view count (non-blocking)
  prisma.communityPost
    .update({ where: { id: params.postId }, data: { views: { increment: 1 } } })
    .catch(() => {});

  return NextResponse.json({ data: post });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Body required" }, { status: 400 });

  const reply = await prisma.communityReply.create({
    data:    { postId: params.postId, userId: session.user.id, body },
    include: { user: { select: { name: true, image: true, role: true } } },
  });

  return NextResponse.json({ data: reply }, { status: 201 });
}
