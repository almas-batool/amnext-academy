// src/components/ai/chat-message.tsx
// Individual chat message bubble with markdown rendering
"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  role:    "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: Props) {
  return (
    <div className={cn("flex gap-3", role === "user" ? "justify-end" : "justify-start")}>
      {role === "assistant" && (
        <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-3.5 h-3.5 text-violet-400" />
        </div>
      )}
      <div className={cn(
        "max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
        role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
      )}>
        {content}
      </div>
      {role === "user" && (
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
    </div>
  );
}
