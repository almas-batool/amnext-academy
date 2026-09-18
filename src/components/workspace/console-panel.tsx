//src/components/workspace/console-panel.tsx

"use client";

import { useState } from "react";
import {
  Terminal,
  AlertCircle,
  CheckCircle2,
  Copy,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConsoleOutput } from "./editor-types";

interface Props {
  output: ConsoleOutput | null;
  loading?: boolean;
}

export function ConsolePanel({ output, loading = false }: Props) {
  const [tab, setTab] = useState<"output" | "error">("output");

  async function copyOutput() {
    if (!output) return;

    const text =
      tab === "output"
        ? (output.stdout ?? "")
        : (output.stderr ?? output.compileOutput ?? "");

    await navigator.clipboard.writeText(text);
  }

  function clearConsole() {
    window.location.reload();
  }

  const hasError = !!output?.stderr || !!output?.compileOutput;

  return (
    <div className="h-full flex flex-col border-t border-border bg-background">
      {/* Header */}

      <div className="border-b border-border px-3 py-2 flex items-center">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={tab === "output" ? "secondary" : "ghost"}
            onClick={() => setTab("output")}
          >
            <Terminal className="h-4 w-4 mr-1" />
            Output
          </Button>

          <Button
            size="sm"
            variant={tab === "error" ? "secondary" : "ghost"}
            onClick={() => setTab("error")}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Errors
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {output?.status && (
            <Badge
              variant={
                output.status === "Accepted"
                  ? "success"
                  : output.status.includes("Error")
                    ? "destructive"
                    : "secondary"
              }
            >
              {output.status}
            </Badge>
          )}

          <Button size="icon" variant="ghost" onClick={copyOutput}>
            <Copy className="h-4 w-4" />
          </Button>

          <Button size="icon" variant="ghost" onClick={clearConsole}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Runtime */}

      {output && (
        <div className="px-3 py-2 border-b border-border flex gap-6 text-xs text-muted-foreground">
          {output.runtime && (
            <span>
              Runtime:
              <span className="ml-1 font-medium text-foreground">
                {output.runtime}
              </span>
            </span>
          )}

          {output.memory && (
            <span>
              Memory:
              <span className="ml-1 font-medium text-foreground">
                {output.memory}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Console */}

      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {loading ? (
          <p className="text-muted-foreground">Running...</p>
        ) : !output ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Terminal className="h-10 w-10 mb-3 opacity-40" />

            <p>No output yet.</p>

            <p className="text-xs mt-1">Run your code to see results.</p>
          </div>
        ) : tab === "output" ? (
          output.stdout ? (
            <pre className="whitespace-pre-wrap">{output.stdout}</pre>
          ) : (
            <p className="text-muted-foreground">No output.</p>
          )
        ) : hasError ? (
          <pre className="text-red-500 whitespace-pre-wrap">
            {output.stderr ?? output.compileOutput}
          </pre>
        ) : (
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
            No errors
          </div>
        )}
      </div>
    </div>
  );
}

