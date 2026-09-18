//src/components/workspace/editor-toolbar.tsx

"use client";

import {
  Play,
  Send,
  RotateCcw,
  Copy,
  Download,
  Save,
  Maximize2,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LanguageSelector } from "./language-selector";
import { SupportedLanguage, EditorTheme } from "./editor-types";

interface Props {
  language: SupportedLanguage;
  theme: EditorTheme;
  fontSize: number;

  running?: boolean;
  submitting?: boolean;
  saving?: boolean;

  onLanguageChange: (lang: SupportedLanguage) => void;
  onThemeChange: (theme: EditorTheme) => void;
  onFontSizeChange: (size: number) => void;

  onRun: () => void;
  onSubmit: () => void;
  onSave: () => void;
  onReset: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onFullscreen: () => void;
}

export function EditorToolbar({
  language,
  theme,
  fontSize,

  running,
  submitting,
  saving,

  onLanguageChange,
  onThemeChange,
  onFontSizeChange,

  onRun,
  onSubmit,
  onSave,
  onReset,
  onCopy,
  onDownload,
  onFullscreen,
}: Props) {
  return (
    <div className="border-b border-border bg-card px-3 py-2 flex flex-wrap items-center gap-2">
      {/* Language */}
      <LanguageSelector value={language} onChange={onLanguageChange} />

      {/* Theme */}

      <Select
        value={theme}
        onValueChange={(v) => onThemeChange(v as EditorTheme)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="vs-dark">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              VS Dark
            </div>
          </SelectItem>

          <SelectItem value="light">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Light
            </div>
          </SelectItem>

          <SelectItem value="hc-black">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              High Contrast
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Font Size */}

      <Select
        value={String(fontSize)}
        onValueChange={(v) => onFontSizeChange(Number(v))}
      >
        <SelectTrigger className="w-[90px]">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {[12, 13, 14, 15, 16, 18, 20, 22, 24].map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}px
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1" />

      {/* Save */}

      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
        disabled={saving}
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save"}
      </Button>

      {/* Copy */}

      <Button variant="outline" size="sm" onClick={onCopy}>
        <Copy className="h-4 w-4" />
      </Button>

      {/* Download */}

      <Button variant="outline" size="sm" onClick={onDownload}>
        <Download className="h-4 w-4" />
      </Button>

      {/* Reset */}

      <Button variant="outline" size="sm" onClick={onReset}>
        <RotateCcw className="h-4 w-4" />
      </Button>

      {/* Fullscreen */}

      <Button variant="outline" size="sm" onClick={onFullscreen}>
        <Maximize2 className="h-4 w-4" />
      </Button>

      {/* Run */}

      <Button
        variant="secondary"
        size="sm"
        onClick={onRun}
        disabled={running}
        className="gap-2"
      >
        <Play className="h-4 w-4" />

        {running ? "Running..." : "Run"}
      </Button>

      {/* Submit */}

      <Button
        size="sm"
        onClick={onSubmit}
        disabled={submitting}
        className="gap-2"
      >
        <Send className="h-4 w-4" />

        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </div>
  );
}

