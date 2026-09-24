"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square, Volume2, VolumeX, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TTS_LANGUAGES, type TTSLanguage } from "@/lib/tts-config";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

type ListenToNotesProps = {
  content: string | null;
};

function formatTime(value: number): string {
  if (!Number.isFinite(value)) return "0:00";
  const seconds = Math.max(0, Math.floor(value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ListenToNotes({ content }: ListenToNotesProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [language, setLanguage] = useState<TTSLanguage>("en");
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(false);
    if (audioRef.current) audioRef.current.pause();
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setAudioUrl(null);
  }, [content]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed, audioUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, audioUrl]);

  const generateAudio = async () => {
    if (!content || isLoading) return;
    setIsLoading(true);
    setError(false);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, language }),
      });
      if (!response.ok) throw new Error("TTS request failed");
      const blob = await response.blob();
      const nextUrl = URL.createObjectURL(blob);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = nextUrl;
      setAudioUrl(nextUrl);
      setCurrentTime(0);
      setDuration(0);
      window.setTimeout(() => audioRef.current?.play().catch(() => setError(true)), 0);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = async () => {
    if (!audioUrl) {
      await generateAudio();
      return;
    }
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      await audioRef.current.play().catch(() => setError(true));
    } else {
      audioRef.current.pause();
    }
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleLanguageChange = (nextLanguage: TTSLanguage) => {
    setLanguage(nextLanguage);
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setAudioUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setError(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasContent = Boolean(content?.trim());

  return (
    <div className="shrink-0 border-b border-border bg-card/60 px-4 py-3">
      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Waves className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium">Listen to Notes</span>
        </div>
        <select
          value={language}
          onChange={(event) => handleLanguageChange(event.target.value as TTSLanguage)}
          aria-label="Narration language"
          className="h-8 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-violet-500"
          disabled={!hasContent || isLoading}
        >
          {Object.entries(TTS_LANGUAGES).map(([value, option]) => <option key={value} value={value}>{option.label}</option>)}
        </select>
        <select
          value={speed}
          onChange={(event) => setSpeed(Number(event.target.value))}
          aria-label="Playback speed"
          className="h-8 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-violet-500"
          disabled={!hasContent}
        >
          {SPEEDS.map((value) => <option key={value} value={value}>{value}x</option>)}
        </select>
        <div className="ml-auto flex items-center gap-1">
          <Button type="button" variant="secondary" size="icon" className="h-8 w-8" onClick={togglePlay} disabled={!hasContent || isLoading} aria-label={isPlaying ? "Pause notes" : "Play notes"}>
            {isLoading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={stop} disabled={!audioUrl} aria-label="Stop notes"><Square className="h-3 w-3" /></Button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="w-8 text-right">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 1}
          step="0.1"
          value={Math.min(currentTime, duration || 1)}
          onChange={(event) => { if (audioRef.current) audioRef.current.currentTime = Number(event.target.value); }}
          aria-label="Playback progress"
          className="h-1 min-w-0 flex-1 accent-violet-500"
          disabled={!audioUrl}
          style={{ background: `linear-gradient(to right, rgb(139 92 246) ${progress}%, rgb(71 65 85) ${progress}%)` }}
        />
        <span className="w-8">{formatTime(duration)}</span>
        {volume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volume" className="w-16 accent-violet-500" />
      </div>
      {isLoading && <p className="mt-2 text-xs text-violet-300">Generating audio...</p>}
      {error && <p className="mt-2 text-xs text-red-300">Unable to generate audio. Try again.</p>}
      {!hasContent && <p className="mt-2 text-xs text-muted-foreground">No notes available for narration.</p>}
    </div>
  );
}
