import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import {
  isTTSLanguage,
  synthesizeSpeech,
  type TTSLanguage,
} from "@/lib/services/tts.service";

const MAX_TEXT_LENGTH = 20_000;

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const body = (await request.json()) as { text?: unknown; language?: unknown };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const language = body.language;

    if (!text || text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text must be between 1 and ${MAX_TEXT_LENGTH} characters.` },
        { status: 400 },
      );
    }
    if (!isTTSLanguage(language)) {
      return NextResponse.json({ error: "Unsupported narration language." }, { status: 400 });
    }

    const result = await synthesizeSpeech(text, language as TTSLanguage);
    return new Response(new Uint8Array(result.audio) as unknown as BodyInit, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(result.audio.byteLength),
        "Cache-Control": "private, max-age=86400",
        "X-TTS-Cache": result.cached ? "HIT" : "MISS",
      },
    });
  } catch (error) {
    console.error("TTS generation failed", error);
    return NextResponse.json(
      { error: "Unable to generate audio. Try again." },
      { status: 502 },
    );
  }
}
