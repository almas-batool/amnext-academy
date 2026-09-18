//src/components/workspace/testcase-panel.tsx

"use client";

import { useState } from "react";
import { Plus, Trash2, Play, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface TestCase {
  id: string;
  title: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

interface Props {
  loading?: boolean;
  onRun?: (testcase: TestCase) => void;
}

export function TestcasePanel({ loading = false, onRun }: Props) {
  const [selected, setSelected] = useState(0);

  const [testcases, setTestcases] = useState<TestCase[]>([
    {
      id: crypto.randomUUID(),
      title: "Sample 1",
      input: "",
      expectedOutput: "",
    },
  ]);

  function updateField(key: keyof TestCase, value: string) {
    const next = [...testcases];

    next[selected] = {
      ...next[selected],
      [key]: value,
    };

    setTestcases(next);
  }

  function addTestcase() {
    setTestcases((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: `Case ${prev.length + 1}`,
        input: "",
        expectedOutput: "",
      },
    ]);

    setSelected(testcases.length);
  }

  function removeTestcase(index: number) {
    if (testcases.length === 1) return;

    const next = testcases.filter((_, i) => i !== index);

    setTestcases(next);

    if (selected >= next.length) {
      setSelected(next.length - 1);
    }
  }

  const testcase = testcases[selected];

  return (
    <div className="h-full flex">
      {/* Sidebar */}

      <div className="w-48 border-r border-border">
        <div className="p-2">
          <Button className="w-full gap-2" size="sm" onClick={addTestcase}>
            <Plus className="h-4 w-4" />
            Add Case
          </Button>
        </div>

        <ScrollArea className="h-[calc(100%-50px)]">
          <div className="space-y-1 p-2">
            {testcases.map((tc, index) => (
              <button
                key={tc.id}
                onClick={() => setSelected(index)}
                className={`w-full rounded-lg border p-2 text-left transition ${
                  selected === index
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{tc.title}</span>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTestcase(index);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {tc.passed !== undefined && (
                  <Badge
                    className="mt-2"
                    variant={tc.passed ? "success" : "destructive"}
                  >
                    {tc.passed ? "Passed" : "Failed"}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Editor */}

      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-3 flex items-center justify-between">
          <h3 className="font-medium">{testcase.title}</h3>

          <Button
            size="sm"
            onClick={() => onRun?.(testcase)}
            disabled={loading}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {loading ? "Running..." : "Run"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 flex-1">
          <div className="space-y-2">
            <p className="text-sm font-medium">Input</p>

            <Textarea
              rows={10}
              value={testcase.input}
              onChange={(e) => updateField("input", e.target.value)}
              placeholder="Enter custom input..."
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Expected Output</p>

            <Textarea
              rows={10}
              value={testcase.expectedOutput}
              onChange={(e) => updateField("expectedOutput", e.target.value)}
              placeholder="Expected output..."
              className="font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

