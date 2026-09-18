//src/components/workspace/code-panel.tsx

"use client";

import { useState, useEffect, useCallback } from "react";

import type { CodingProblem } from "@prisma/client";

//import { useToast } from "@/hooks/use-toast";

import { EditorToolbar } from "./editor-toolbar";
import { CodeEditor } from "./code-editor";
import { ConsolePanel } from "./console-panel";
import { TestcasePanel } from "./testcase-panel";
import { SubmissionHistory } from "./submission-history";

import type { SubmissionHistoryItem } from "./submission-history";

import { SupportedLanguage, EditorTheme, ConsoleOutput } from "./editor-types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  problem: CodingProblem | null;
  certId: string;
}

const DEFAULT_CODE: Record<SupportedLanguage, string> = {
  javascript: `console.log("Hello AMNext Academy");`,

  typescript: `console.log("Hello AMNext Academy");`,

  python: `print("Hello AMNext Academy")`,

  java: `
public class Main {
    public static void main(String[] args){
        System.out.println("Hello AMNext Academy");
    }
}
`,

  cpp: `
#include<iostream>
using namespace std;

int main() {
    cout<<"Hello AMNext Academy";
    return 0;
}
`,

  c: `
#include<stdio.h>

int main() {
    printf("Hello AMNext Academy");
    return 0;
}
`,

  go: `
package main

import "fmt"

func main() {
    fmt.Println("Hello AMNext Academy")
}
`,

  rust: `
fn main() {
    println!("Hello AMNext Academy");
}
`,

  php: `
<?php
echo "Hello AMNext Academy";
?>
`,
};

export function CodePanel({ problem }: Props) {
  // const { toast } = useToast();

  const [language, setLanguage] = useState<SupportedLanguage>("javascript");

  const [theme, setTheme] = useState<EditorTheme>("vs-dark");

  const [fontSize, setFontSize] = useState(14);

  const [code, setCode] = useState(DEFAULT_CODE.javascript);

  const [running, setRunning] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [saving, setSaving] = useState(false);

  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput>({});

  const [submissions, setSubmissions] = useState<SubmissionHistoryItem[]>([]);

  // =============================
  // Load Submission History
  // =============================

  const loadHistory = useCallback(async () => {
    if (!problem) return;

    try {
      const res = await fetch(`/api/coding/history?problemId=${problem.id}`);

      if (!res.ok) return;

      const json = await res.json();

      setSubmissions(json.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }, [problem]);

  // =============================
  // Run Code
  // =============================

  const handleRun = async () => {
    setRunning(true);

    try {
      const res = await fetch("/api/coding/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          code,
          stdin: "",
        }),
      });

      const json = await res.json();

      if (json.error) {
        setConsoleOutput({
          stderr: json.error,
        });

        return;
      }

      setConsoleOutput({
        stdout: json.data.run.stdout,
        stderr: json.data.run.stderr,
        compileOutput: json.data.compile?.stderr,
      });
    } catch (err) {
      console.error(err);

      setConsoleOutput({
        stderr: "Unable to execute code.",
      });
    } finally {
      setRunning(false);
    }
  };

  // =============================
  // Submit Code
  // =============================

  const handleSubmit = async () => {
    if (!problem) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/coding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code,
        }),
      });

      const json = await res.json();

      if (json.error) {
        setConsoleOutput({
          stderr: json.error,
        });

        return;
      }

      const result = json.data;

      setConsoleOutput({
        stdout: `${result.passed}/${result.total} test cases passed`,
        status: result.status,
      });

      loadHistory();
    } catch (err) {
      console.error(err);

      setConsoleOutput({
        stderr: "Submission failed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =============================
  // Save Draft
  // =============================

  const handleSave = async () => {
    setSaving(true);

    localStorage.setItem(`code-${problem?.id}-${language}`, code);

    setTimeout(() => {
      setSaving(false);
    }, 500);
  };

  // =============================
  // Reset Code
  // =============================

  const handleReset = () => {
    setCode(DEFAULT_CODE[language]);
  };

  // =============================
  // Copy Code
  // =============================

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
  };

  // =============================
  // Download Code
  // =============================

  const handleDownload = () => {
    const blob = new Blob([code], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = `solution.${language}`;

    a.click();

    URL.revokeObjectURL(url);
  };

  // =============================
  // Fullscreen
  // =============================

  const handleFullscreen = () => {
    document.documentElement.requestFullscreen?.();
  };

  // =============================
  // Load saved draft
  // =============================

  useEffect(() => {
    if (!problem) return;

    const saved = localStorage.getItem(`code-${problem.id}-${language}`);

    if (saved) {
      setCode(saved);
    } else {
      setCode(DEFAULT_CODE[language]);
    }

    loadHistory();
  }, [problem, language, loadHistory]);
  return (
    <div className="flex h-full flex-col">
      <EditorToolbar
        language={language}
        theme={theme}
        fontSize={fontSize}
        running={running}
        submitting={submitting}
        saving={saving}
        onLanguageChange={setLanguage}
        onThemeChange={setTheme}
        onFontSizeChange={setFontSize}
        onRun={handleRun}
        onSubmit={handleSubmit}
        onSave={handleSave}
        onReset={handleReset}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onFullscreen={handleFullscreen}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col">
          <div className="flex-1 border-b">
            <CodeEditor
              language={language}
              value={code}
              theme={theme}
              fontSize={fontSize}
              onChange={(value) => setCode(value ?? "")}
            />
          </div>

          <div className="h-56 border-t">
            <ConsolePanel output={consoleOutput} />
          </div>
        </div>

        <div className="w-[360px] border-l flex flex-col">
          <Tabs defaultValue="tests" className="flex h-full flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tests">Test Cases</TabsTrigger>

              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="tests" className="flex-1 m-0 overflow-hidden">
              <TestcasePanel loading={running} />
            </TabsContent>

            <TabsContent value="history" className="flex-1 m-0 overflow-hidden">
              <SubmissionHistory submissions={submissions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

