// src/app/api/community/posts/[postId]/vote/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { value = 1 } = await req.json();

  // Upsert vote
  const existing = await prisma.postVote.findUnique({
    where: { postId_userId: { postId: params.postId, userId: session.user.id } },
  });

  if (existing) {
    if (existing.value === value) {
      // Un-vote
      await prisma.postVote.delete({ where: { id: existing.id } });
      await prisma.communityPost.update({ where: { id: params.postId }, data: { upvotes: { decrement: value } } });
    } else {
      await prisma.postVote.update({ where: { id: existing.id }, data: { value } });
      await prisma.communityPost.update({ where: { id: params.postId }, data: { upvotes: { increment: value - existing.value } } });
    }
  } else {
    await prisma.postVote.create({ data: { postId: params.postId, userId: session.user.id, value } });
    await prisma.communityPost.update({ where: { id: params.postId }, data: { upvotes: { increment: value } } });
  }

  return NextResponse.json({ message: "Vote recorded" });
}
