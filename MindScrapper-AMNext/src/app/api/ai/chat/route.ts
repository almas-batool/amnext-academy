// ─────────────────────────────────────────────────────────────
//  src/app/api/ai/chat/route.ts
//  SSE streaming AI Tutor with course-context RAG.
// ─────────────────────────────────────────────────────────────
import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });

  const { message, chatId, certId, chapterId } = await req.json();
  if (!message?.trim())
    return new Response(JSON.stringify({ error: "message required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

  // Build context from chapter / cert content
  let contextText = "";
  let chapterTitle = "this topic";
  let certTitle = "this course";

  if (chapterId) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });
    if (chapter) {
      chapterTitle = chapter.title;
      contextText = chapter.content ?? chapter.summary ?? "";
    }
  }

  if (certId) {
    const cert = await prisma.certification.findUnique({
      where: { id: certId },
    });
    if (cert) {
      certTitle = cert.title;
      if (!contextText)
        contextText = `Course: ${cert.title}\nDescription: ${cert.description}\nLearning Outcomes: ${JSON.stringify(cert.learningOutcomes)}`;
    }
  }

  const systemPrompt = `You are an expert AI tutor for the course "${certTitle}", currently helping with chapter "${chapterTitle}".

${contextText ? `COURSE MATERIAL:\n${contextText.slice(0, 4000)}\n\n` : ""}
RULES:
1. Base answers on the course material when relevant.
2. If the answer isn't in the material, provide accurate general knowledge and label it "(General knowledge)".
3. Be clear, encouraging, and educational.
4. Use markdown code blocks for code examples.
5. Never fabricate facts or invent information.

Respond concisely with markdown formatting.`;

  // Fetch chat history (last 10 messages)
  const existingChat = chatId
    ? await prisma.aIChat.findUnique({ where: { id: chatId } })
    : null;

  const history = (
    (existingChat?.messages as Array<{ role: string; content: string }>) ?? []
  )
    .slice(-10)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    ...history,
    { role: "user", content: message },
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      try {
        const response = await anthropic.messages.create({
          model: "claude-opus-4-7",
          max_tokens: 1024,
          system: systemPrompt,
          messages,
          stream: true,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullResponse += event.delta.text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: event.delta.text })}\n\n`,
              ),
            );
          }
        }

        // Persist chat
        const newMessages = [
          ...((existingChat?.messages as any[]) ?? []),
          {
            role: "user",
            content: message,
            timestamp: new Date().toISOString(),
          },
          {
            role: "assistant",
            content: fullResponse,
            timestamp: new Date().toISOString(),
          },
        ];

        const savedChat = existingChat
          ? await prisma.aIChat.update({
              where: { id: existingChat.id },
              data: { messages: newMessages },
            })
          : await prisma.aIChat.create({
              data: {
                userId: session.user.id,
                certId: certId ?? null,
                chapterId: chapterId ?? null,
                title: message.slice(0, 60),
                messages: newMessages,
              },
            });

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ chatId: savedChat.id, done: true })}\n\n`,
          ),
        );
      } catch (err: any) {
        console.error("ANTHROPIC ERROR:", err);

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              error: err?.message ?? "AI error",
            })}\n\n`,
          ),
        );
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function GET() {
  const session = await getAuthSession();
  if (!session)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });

  const chats = await prisma.aIChat.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true, certId: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return new Response(JSON.stringify({ data: chats }), {
    headers: { "Content-Type": "application/json" },
  });
}
