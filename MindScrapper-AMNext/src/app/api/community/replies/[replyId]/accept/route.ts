// src/app/api/community/replies/[replyId]/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import { awardXP }        from "@/lib/services/gamification.service";

export async function POST(
  _req: NextRequest,
  { params }: { params: { replyId: string } }
) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reply = await prisma.communityReply.findUnique({
    where:   { id: params.replyId },
    include: { post: { select: { userId: true } } },
  });

  if (!reply) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the post author can accept an answer
  if (reply.post.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.communityReply.update({
    where: { id: params.replyId },
    data:  { accepted: true },
  });

  // Award XP to the reply author
  await awardXP(reply.userId, "community_answer_accepted", { replyId: reply.id });

  return NextResponse.json({ message: "Answer accepted" });
}
