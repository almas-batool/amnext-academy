//src/components/workspace/language-selector.tsx

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Code2, Braces, FileCode2, Terminal } from "lucide-react";

import { LanguageOption, SupportedLanguage } from "./editor-types";

interface Props {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
}

export const LANGUAGES: LanguageOption[] = [
  {
    id: 63,
    value: "javascript",
    label: "JavaScript",
    extension: "js",
    monaco: "javascript",
    version: "Node 20",
  },
  {
    id: 74,
    value: "typescript",
    label: "TypeScript",
    extension: "ts",
    monaco: "typescript",
    version: "5.x",
  },
  {
    id: 71,
    value: "python",
    label: "Python",
    extension: "py",
    monaco: "python",
    version: "3.12",
  },
  {
    id: 62,
    value: "java",
    label: "Java",
    extension: "java",
    monaco: "java",
    version: "21",
  },
  {
    id: 54,
    value: "cpp",
    label: "C++",
    extension: "cpp",
    monaco: "cpp",
    version: "17",
  },
  {
    id: 50,
    value: "c",
    label: "C",
    extension: "c",
    monaco: "c",
    version: "17",
  },
  {
    id: 60,
    value: "go",
    label: "Go",
    extension: "go",
    monaco: "go",
    version: "1.22",
  },
  {
    id: 73,
    value: "rust",
    label: "Rust",
    extension: "rs",
    monaco: "rust",
    version: "1.80",
  },
  {
    id: 68,
    value: "php",
    label: "PHP",
    extension: "php",
    monaco: "php",
    version: "8.3",
  },
];

function getIcon(language: SupportedLanguage) {
  switch (language) {
    case "javascript":
    case "typescript":
      return <Braces className="h-4 w-4" />;

    case "python":
      return <Terminal className="h-4 w-4" />;

    case "java":
    case "cpp":
    case "c":
      return <FileCode2 className="h-4 w-4" />;

    default:
      return <Code2 className="h-4 w-4" />;
  }
}

export function LanguageSelector({ value, onChange }: Props) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as SupportedLanguage)}
    >
      <SelectTrigger className="w-[170px]">
        <div className="flex items-center gap-2">
          {getIcon(value)}
          <SelectValue />
        </div>
      </SelectTrigger>

      <SelectContent>
        {LANGUAGES.map((language) => (
          <SelectItem key={language.value} value={language.value}>
            <div className="flex items-center gap-2">
              {getIcon(language.value)}

              <span>{language.label}</span>

              <span className="text-xs text-muted-foreground">
                .{language.extension}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

