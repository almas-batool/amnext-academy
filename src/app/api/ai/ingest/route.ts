// ─────────────────────────────────────────────────────────────
//  src/app/api/ai/ingest/route.ts
//  POST — ingest chapter content into RAG chunks.
//  Called after a chapter's content/PDF is uploaded.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession }            from "@/lib/auth";
import { prisma }                    from "@/lib/prisma";
import { ingestChapterContent }      from "@/lib/rag/ingest";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !["ADMIN", "INSTRUCTOR"].includes(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { chapterId } = await req.json();
  if (!chapterId)
    return NextResponse.json({ error: "chapterId required" }, { status: 400 });

  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  const text = [chapter.content, chapter.summary]
    .filter(Boolean)
    .join("\n\n");

  if (!text.trim())
    return NextResponse.json({ error: "Chapter has no content to ingest" }, { status: 400 });

  const count = await ingestChapterContent(chapterId, text);

  return NextResponse.json({ data: { chunksCreated: count } });
}

