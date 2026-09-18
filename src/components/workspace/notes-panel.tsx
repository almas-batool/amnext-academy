// src/components/workspace/notes-panel.tsx
"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";
import type { Chapter } from "@prisma/client";

export function NotesPanel({ chapter }: { chapter: Chapter | null }) {
  if (!chapter)
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Select a chapter to start reading</p>
        </div>
      </div>
    );

  return (
    <ScrollArea className="h-full">
      <div className="p-6 prose-AMNext Academy max-w-none">
        {chapter.content ? (
          <div
            dangerouslySetInnerHTML={{ __html: mdToHtml(chapter.content) }}
          />
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No notes available for this chapter.</p>
            {chapter.pdfUrl && (
              <p className="text-sm mt-2">
                Switch to the PDF tab to view the PDF.
              </p>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

/** Very simple markdown → HTML (no external dep). */
function mdToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/```[\w]*\n([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/^\s*[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*<\/li>)/, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hupol])(.+)$/gm, "<p>$1</p>");
}

