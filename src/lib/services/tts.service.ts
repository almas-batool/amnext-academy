import { createHash } from "crypto";
import { TTS_LANGUAGES, type TTSLanguage } from "@/lib/tts-config";

export type { TTSLanguage } from "@/lib/tts-config";

type CachedAudio = {
  audio: Buffer;
  createdAt: number;
};

const globalForTTS = globalThis as unknown as {
  ttsCache: Map<string, CachedAudio> | undefined;
};
const cache = globalForTTS.ttsCache ?? new Map<string, CachedAudio>();
if (process.env.NODE_ENV !== "production") globalForTTS.ttsCache = cache;

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

export function isTTSLanguage(value: unknown): value is TTSLanguage {
  return typeof value === "string" && value in TTS_LANGUAGES;
}

export function getTTSCacheKey(text: string, language: TTSLanguage): string {
  const voice = TTS_LANGUAGES[language].voiceName;
  return createHash("sha256").update(`${text}\n${language}\n${voice}`).digest("hex");
}

function getCachedAudio(key: string): Buffer | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.audio;
}

function setCachedAudio(key: string, audio: Buffer): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { audio, createdAt: Date.now() });
}

async function synthesizeWithGoogle(text: string, language: TTSLanguage): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
  if (!apiKey) {
    throw new Error("TTS provider is not configured. Set GOOGLE_CLOUD_TTS_API_KEY.");
  }

  const voice = TTS_LANGUAGES[language];
  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: voice.languageCode, name: voice.voiceName },
      audioConfig: { audioEncoding: "MP3" },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Google Cloud TTS request failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  const payload = (await response.json()) as { audioContent?: string };
  if (!payload.audioContent) throw new Error("TTS provider returned no audio.");
  return Buffer.from(payload.audioContent, "base64");
}

async function translateForNarration(text: string, language: TTSLanguage): Promise<string> {
  if (language === "en") return text;

  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
  if (!apiKey) {
    throw new Error("TTS provider is not configured. Set GOOGLE_CLOUD_TTS_API_KEY.");
  }

  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target: language, format: "text" }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Google Translation request failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    data?: { translations?: Array<{ translatedText?: string }> };
  };
  const translatedText = payload.data?.translations?.[0]?.translatedText;
  if (!translatedText) throw new Error("Translation provider returned no text.");
  return translatedText;
}

export async function synthesizeSpeech(text: string, language: TTSLanguage): Promise<{ audio: Buffer; cached: boolean }> {
  const key = getTTSCacheKey(text, language);
  const cached = getCachedAudio(key);
  if (cached) return { audio: cached, cached: true };

  const narrationText = await translateForNarration(text, language);
  const audio = await synthesizeWithGoogle(narrationText, language);
  setCachedAudio(key, audio);
  return { audio, cached: false };
}
