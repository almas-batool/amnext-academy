// src/components/workspace/pdf-panel.tsx
"use client";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PDFPanel({ pdfUrl }: { pdfUrl: string | null }) {
  if (!pdfUrl) return (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      <div className="text-center"><FileText className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>No PDF available for this chapter</p></div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-border flex justify-end">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
          </a>
        </Button>
      </div>
      <iframe src={pdfUrl} className="flex-1 w-full" title="Chapter PDF" />
    </div>
  );
}
