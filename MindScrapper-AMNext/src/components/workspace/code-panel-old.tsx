// ─────────────────────────────────────────────────────────────
//  src/components/workspace/code-panel-old.tsx
//  Monaco-style code editor panel with Piston execution.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState, useCallback } from "react";
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_LANGUAGES } from "@/config/constants";
import type { CodingProblem } from "@prisma/client";
import dynamic from "next/dynamic";

// Lazy load Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-[#1e1e1e] flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface Props {
  problem: CodingProblem | null;
  certId: string;
}

type TabKey = "problem" | "output";

const DEFAULT_CODE: Record<string, string> = {
  javascript: "// Write your solution here\n\n",
  python: "# Write your solution here\n\n",
  java: "public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n",
};

export function CodePanel({ problem, certId }: Props) {
  const { toast } = useToast();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(() => {
    if (!problem) return DEFAULT_CODE.javascript;
    const starter = problem.starterCode as Record<string, string>;
    return starter?.[language] ?? DEFAULT_CODE[language] ?? "// Start coding\n";
  });
  const [tab, setTab] = useState<TabKey>("problem");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState<{
    stdout?: string;
    stderr?: string;
    results?: any[];
    passed?: number;
    total?: number;
    status?: string;
  } | null>(null);

  const handleLangChange = (lang: string) => {
    setLanguage(lang);
    if (problem) {
      const starter = problem.starterCode as Record<string, string>;
      setCode(starter?.[lang] ?? DEFAULT_CODE[lang] ?? "// Start coding\n");
    } else {
      setCode(DEFAULT_CODE[lang] ?? "// Start coding\n");
    }
  };

  const runCode = useCallback(async () => {
    setRunning(true);
    setTab("output");
    try {
      const res = await fetch("/api/coding/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const json = await res.json();
      setOutput({
        stdout: json.data?.run?.stdout,
        stderr: json.data?.run?.stderr,
      });
    } catch {
      toast({ title: "Execution error", variant: "destructive" });
    } finally {
      setRunning(false);
    }
  }, [language, code, toast]);

  const submitCode = useCallback(async () => {
    if (!problem) return;
    setSubmitting(true);
    setTab("output");
    try {
      const res = await fetch("/api/coding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, language, code }),
      });
      const json = await res.json();
      setOutput(json.data);
      if (json.data?.status === "ACCEPTED") {
        toast({ title: "✅ All tests passed!", variant: "success" as any });
      } else {
        toast({
          title: "Some tests failed",
          description: `${json.data?.passed}/${json.data?.total} passed`,
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Submission error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }, [problem, language, code, toast]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0 flex-wrap">
        <Select value={language} onValueChange={handleLangChange}>
          <SelectTrigger className="h-7 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value} className="text-xs">
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs gap-1"
            onClick={() => setCode(DEFAULT_CODE[language] ?? "")}
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 px-2.5 text-xs gap-1"
            onClick={runCode}
            disabled={running || submitting}
          >
            {running ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            Run
          </Button>
          {problem && (
            <Button
              size="sm"
              variant="gradient"
              className="h-7 px-2.5 text-xs gap-1"
              onClick={submitCode}
              disabled={running || submitting}
            >
              {submitting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              Submit
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language={language === "cpp" ? "cpp" : language}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          theme="vs-dark"
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Bottom: Problem / Output tabs */}
      <div className="h-48 border-t border-border flex flex-col shrink-0">
        <div className="flex gap-1 px-3 py-1.5 border-b border-border shrink-0">
          {(["problem", "output"] as TabKey[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-2.5 py-1 rounded capitalize ${tab === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
              {t === "output" && output && (
                <span
                  className={`ml-1.5 w-1.5 h-1.5 rounded-full inline-block ${output.status === "ACCEPTED" ? "bg-emerald-400" : "bg-red-400"}`}
                />
              )}
            </button>
          ))}
        </div>

        <ScrollArea className="flex-1 p-3">
          {tab === "problem" ? (
            problem ? (
              <div className="text-xs space-y-2">
                <p className="font-semibold text-sm">{problem.title}</p>
                <Badge
                  variant={
                    problem.difficulty === "BEGINNER"
                      ? "success"
                      : problem.difficulty === "INTERMEDIATE"
                        ? "warning"
                        : "destructive"
                  }
                  className="text-[10px]"
                >
                  {problem.difficulty}
                </Badge>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono text-[11px]">
                  {/* Strip markdown for brevity */}
                  {problem.description
                    .replace(/#{1,3} /g, "")
                    .replace(/\*\*/g, "")
                    .slice(0, 600)}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No problem loaded. Use the coding practice section for
                challenges.
              </p>
            )
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {output ? (
                <>
                  {output.results && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {output.status === "ACCEPTED" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="font-semibold">
                          {output.passed}/{output.total} tests passed
                        </span>
                      </div>
                      {output.results.map((r: any, i: number) => (
                        <div
                          key={i}
                          className={`rounded p-2 text-[11px] ${r.passed ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                        >
                          Test {i + 1}: {r.passed ? "✓ Passed" : "✗ Failed"}
                          {!r.hidden && !r.passed && (
                            <div className="text-muted-foreground mt-1 space-y-0.5">
                              <div>
                                Expected:{" "}
                                <span className="text-foreground">
                                  {r.expected}
                                </span>
                              </div>
                              <div>
                                Got:{" "}
                                <span className="text-foreground">
                                  {r.actual}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {output.stdout && (
                    <div>
                      <p className="text-muted-foreground mb-1">stdout:</p>
                      <pre className="bg-muted rounded p-2 text-[11px] overflow-x-auto whitespace-pre-wrap">
                        {output.stdout}
                      </pre>
                    </div>
                  )}
                  {output.stderr && (
                    <div>
                      <p className="text-red-400 mb-1">stderr:</p>
                      <pre className="bg-red-500/10 rounded p-2 text-[11px] text-red-400 overflow-x-auto whitespace-pre-wrap">
                        {output.stderr}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">
                  Run your code to see output here.
                </p>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
