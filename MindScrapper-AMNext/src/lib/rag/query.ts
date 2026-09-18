// ─────────────────────────────────────────────────────────────
//  src/lib/rag/query.ts
//  Retrieves relevant RAG chunks for a query using
//  keyword/full-text search (no vector DB needed).
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";

export interface RetrievedChunk {
  id:        string;
  text:      string;
  page:      number | null;
  chapterId: string;
}

/** Retrieve top-k relevant chunks for a query using keyword matching. */
export async function retrieveChunks(
  query:      string,
  certId?:    string,
  chapterId?: string,
  topK = 5
): Promise<RetrievedChunk[]> {
  // Build keyword filter from top words in query
  const keywords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);

  if (keywords.length === 0) return [];

  const where: any = {};

  if (chapterId) {
    where.chapterId = chapterId;
  } else if (certId) {
    where.chapter = { certId };
  }

  // Keyword OR search
  where.OR = keywords.map((kw) => ({
    text: { contains: kw, mode: "insensitive" },
  }));

  const chunks = await prisma.rAGChunk.findMany({
    where,
    take:    topK * 2,
    select: { id: true, text: true, page: true, chapterId: true },
  });

  // Simple relevance: count how many keywords each chunk matches
  const scored = chunks.map((c) => ({
    ...c,
    score: keywords.filter((kw) => c.text.toLowerCase().includes(kw)).length,
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ score: _s, ...c }) => c);
}

/** Build context string from retrieved chunks. */
export function buildContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((c) => `[Page ${c.page ?? "?"}]: ${c.text}`)
    .join("\n\n---\n\n");
}
