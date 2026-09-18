// src/components/community/rich-editor.tsx
// Simple rich text editor using Tiptap (optional — falls back to textarea)
"use client";

import { Textarea } from "@/components/ui/textarea";

interface Props {
  value:       string;
  onChange:    (val: string) => void;
  placeholder?: string;
  rows?:       number;
}

// Using a plain Textarea for now — swap for Tiptap if needed.
// Tiptap requires: npm install @tiptap/react @tiptap/starter-kit
export function RichEditor({ value, onChange, placeholder, rows = 5 }: Props) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="resize-none font-mono text-sm"
    />
  );
}
