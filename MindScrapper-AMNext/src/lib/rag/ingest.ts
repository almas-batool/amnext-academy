// ─────────────────────────────────────────────────────────────
//  src/lib/rag/ingest.ts
//  PDF → text → chunks → stored in DB for context retrieval.
//  No pgvector required — uses full-text search fallback.
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";

const CHUNK_SIZE  = 500; // approximate characters per chunk
const OVERLAP     = 50;

/** Ingest a chapter's text content into RAGChunk records. */
export async function ingestChapterContent(
  chapterId: string,
  text: string
): Promise<number> {
  // Delete existing chunks for this chapter
  await prisma.rAGChunk.deleteMany({ where: { chapterId } });

  const chunks = splitIntoChunks(text, CHUNK_SIZE, OVERLAP);

  await prisma.rAGChunk.createMany({
    data: chunks.map((chunk, i) => ({
      chapterId,
      text:       chunk.text,
      page:       chunk.page,
      tokenCount: Math.ceil(chunk.text.length / 4),
    })),
  });

  return chunks.length;
}

/** Split plain text into overlapping chunks. */
function splitIntoChunks(
  text: string,
  size: number,
  overlap: number
): Array<{ text: string; page: number }> {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks:    { text: string; page: number }[] = [];

  let current = "";
  let pageEst = 1;

  for (const sentence of sentences) {
    if ((current + sentence).length > size && current.length > 0) {
      chunks.push({ text: current.trim(), page: pageEst });
      // Overlap: keep last `overlap` chars
      current = current.slice(-overlap) + " " + sentence;
      pageEst = Math.ceil(chunks.length * size / 3000) + 1;
    } else {
      current += " " + sentence;
    }
  }

  if (current.trim().length > 0) {
    chunks.push({ text: current.trim(), page: pageEst });
  }

  return chunks;
}
