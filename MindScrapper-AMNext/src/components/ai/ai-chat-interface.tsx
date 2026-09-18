// src/components/ai/ai-chat-interface.tsx
// Full-page standalone AI chat interface
"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, User, Sparkles, Plus } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge }    from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Message { role: "user" | "assistant"; content: string }

const QUICK_PROMPTS = [
  "Explain this concept in simple terms",
  "Give me a real-world example",
  "Create 5 practice questions",
  "What are common mistakes?",
  "Summarise in bullet points",
  "Help me debug this code",
];

export function AIChatInterface() {
  const { data: session } = useSession();
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input,    setInput]      = useState("");
  const [chatId,   setChatId]     = useState<string | null>(null);
  const [streaming,setStreaming]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: chatsData } = useQuery({
    queryKey: ["ai-chats"],
    queryFn:  async () => { const r = await fetch("/api/ai/chat"); return r.json(); },
    enabled:  !!session,
  });
  const chatHistory = chatsData?.data ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setStreaming(true);
    setMessages((p) => [...p, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: text, chatId }),
      });
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const d = JSON.parse(line.slice(6));
            if (d.text) {
              setMessages((p) => {
                const n = [...p];
                n[n.length - 1] = { ...n[n.length - 1], content: n[n.length - 1].content + d.text };
                return n;
              });
            }
            if (d.chatId) setChatId(d.chatId);
          } catch {}
        }
      }
    } catch {
      setMessages((p) => { const n = [...p]; n[n.length - 1].content = "Sorry, something went wrong."; return n; });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar — chat history */}
      <div className="hidden md:flex w-56 border-r border-border flex-col bg-card shrink-0">
        <div className="p-3 border-b border-border">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 text-xs"
            onClick={() => { setMessages([]); setChatId(null); }}
          >
            <Plus className="w-3.5 h-3.5" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chatHistory.map((c: any) => (
              <button
                key={c.id}
                onClick={() => { setChatId(c.id); setMessages([]); }}
                className={cn(
                  "w-full text-left px-2 py-2 rounded text-xs hover:bg-accent transition-colors truncate",
                  chatId === c.id && "bg-accent"
                )}
              >
                {c.title ?? "Untitled"}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium">AI Tutor</p>
            <p className="text-xs text-muted-foreground">Powered by Claude</p>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px] gap-1">
            <Sparkles className="w-3 h-3" /> AI
          </Badge>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto">
                <Bot className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <p className="font-semibold text-lg">Ask me anything</p>
                <p className="text-sm text-muted-foreground mt-1">
                  I can explain concepts, generate examples, create quizzes, and debug code.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="text-left text-xs bg-muted hover:bg-accent rounded-lg p-3 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                )}>
                  {m.content || (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
                    </span>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div ref={bottomRef} />
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t border-border shrink-0">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
              className="resize-none text-sm min-h-[40px] max-h-[120px]"
              rows={1}
              disabled={streaming}
            />
            <Button
              size="icon"
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              className="shrink-0"
            >
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
