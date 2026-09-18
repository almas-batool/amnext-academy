// src/components/ai/citation-badge.tsx
import { FileText } from "lucide-react";

interface Props { page: number; chapterTitle?: string }

export function CitationBadge({ page, chapterTitle }: Props) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded px-1.5 py-0.5 cursor-default"
      title={chapterTitle ? `${chapterTitle}, Page ${page}` : `Page ${page}`}
    >
      <FileText className="w-2.5 h-2.5" /> p.{page}
    </span>
  );
}

