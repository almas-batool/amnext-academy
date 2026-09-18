// ─────────────────────────────────────────────────────────────
//  src/components/workspace/workspace-client.tsx
//  Client-side three-panel workspace orchestrator.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Code2,
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
  ClipboardList,
} from "lucide-react";
import { PDFPanel } from "./pdf-panel";
import { CodePanel } from "./code-panel-old";
import { AIChatPanel } from "./ai-chat-panel";
import { NotesPanel } from "./notes-panel";
import {
  AssessmentsPanel,
  type WorkspaceAssessment,
} from "./assessments-panel";
import type { Chapter, Certification, CodingProblem } from "@prisma/client";

interface Props {
  cert: Certification & { chapters: Chapter[] };
  chapters: Chapter[];
  activeChapter: Chapter | null;
  firstProblem: CodingProblem | null;
  assessments: WorkspaceAssessment[];
  userId: string;
}

export function WorkspaceClient({
  cert,
  chapters,
  activeChapter,
  firstProblem,
  assessments,
  userId,
}: Props) {
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(activeChapter);
  const [rightTab, setRightTab] = useState<"code" | "ai">("code");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const chapterIndex = chapter
    ? chapters.findIndex((c) => c.id === chapter.id)
    : 0;

  const navigate = useCallback(
    (ch: Chapter) => {
      setChapter(ch);
      router.push(`/certifications/${cert.id}/learn?chapter=${ch.id}`, {
        scroll: false,
      });
      // Award XP for reading a chapter (debounced server-side)
      fetch("/api/gamification/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "chapter_read",
          meta: { chapterId: ch.id },
        }),
      }).catch(() => {});
    },
    [cert.id, router],
  );

  return (
    <div className="-m-6 h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Chapter sidebar */}
      <div
        className={`border-r border-border bg-card flex flex-col transition-all duration-200 ${sidebarOpen ? "w-60 shrink-0" : "w-0 overflow-hidden"}`}
      >
        <div className="p-3 border-b border-border">
          <p className="font-semibold text-sm truncate">{cert.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {chapters.length} chapters
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => navigate(ch)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-start gap-2 transition-colors ${
                  chapter?.id === ch.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="shrink-0 w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-tight">{ch.title}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main panels */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 z-10 w-5 h-10 bg-border rounded-r flex items-center justify-center hover:bg-accent"
          style={{ left: sidebarOpen ? 240 : 0 }}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>

        {/* LEFT: PDF + Notes */}
        <div className="flex-1 min-w-0 border-r border-border flex flex-col">
          <div className="border-b border-border px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate">
                {chapter?.title ?? "Select a chapter"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  chapterIndex > 0 && navigate(chapters[chapterIndex - 1])
                }
                disabled={chapterIndex === 0}
                className="h-7 w-7"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {chapterIndex + 1}/{chapters.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  chapterIndex < chapters.length - 1 &&
                  navigate(chapters[chapterIndex + 1])
                }
                disabled={chapterIndex === chapters.length - 1}
                className="h-7 w-7"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <Tabs
            defaultValue="notes"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="shrink-0 w-full rounded-none border-b border-border bg-transparent justify-start px-4 h-10">
              <TabsTrigger value="notes" className="gap-1.5 text-xs">
                <BookOpen className="w-3.5 h-3.5" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="pdf" className="gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5" />
                PDF
              </TabsTrigger>
              <TabsTrigger value="assess" className="gap-1.5 text-xs">
                <ClipboardList className="w-3.5 h-3.5" />
                Assessments
                {assessments.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[9px] h-4 px-1 ml-0.5"
                  >
                    {assessments.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="flex-1 overflow-hidden m-0">
              <NotesPanel chapter={chapter} />
            </TabsContent>
            <TabsContent value="pdf" className="flex-1 overflow-hidden m-0">
              <PDFPanel pdfUrl={chapter?.pdfUrl ?? null} />
            </TabsContent>
            <TabsContent value="assess" className="flex-1 overflow-hidden m-0">
              <AssessmentsPanel certId={cert.id} assessments={assessments} />
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT: Code + AI */}
        <div className="w-[45%] min-w-0 flex flex-col shrink-0">
          <div className="border-b border-border px-4 py-2 flex gap-2 shrink-0">
            <Button
              size="sm"
              variant={rightTab === "code" ? "secondary" : "ghost"}
              className="gap-1.5 h-7 text-xs"
              onClick={() => setRightTab("code")}
            >
              <Code2 className="w-3.5 h-3.5" /> Code Editor
            </Button>
            <Button
              size="sm"
              variant={rightTab === "ai" ? "secondary" : "ghost"}
              className="gap-1.5 h-7 text-xs"
              onClick={() => setRightTab("ai")}
            >
              <Bot className="w-3.5 h-3.5" /> AI Tutor
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            {rightTab === "code" ? (
              <CodePanel problem={firstProblem} certId={cert.id} />
            ) : (
              <AIChatPanel
                certId={cert.id}
                chapterId={chapter?.id}
                chapterTitle={chapter?.title}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
