// ─────────────────────────────────────────────────────────────
//  src/lib/services/piston.service.ts
//  Wraps the Piston API for multi-language code execution.
// ─────────────────────────────────────────────────────────────

import { PISTON_VERSIONS } from "@/config/constants";

const PISTON_URL =
  process.env.PISTON_API_URL ?? "https://emkc.org/api/v2/piston";

export interface ExecutionResult {
  stdout:  string;
  stderr:  string;
  code:    number | null;
  signal:  string | null;
}

export interface RunOutput {
  language: string;
  version:  string;
  run:      ExecutionResult;
  compile?: ExecutionResult;
}

export interface TestResult {
  input:    string;
  expected: string;
  actual:   string;
  passed:   boolean;
  runtime?: number;
  hidden?:  boolean;
  stderr?:  string;
}

// ── Core execute ───────────────────────────────────────────────

export async function executeCode(
  language: string,
  code: string,
  stdin = ""
): Promise<RunOutput> {
  const lang = PISTON_VERSIONS[language] ?? { language, version: "*" };
  const ext  = getExtension(language);

  const res = await fetch(`${PISTON_URL}/execute`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language:             lang.language,
      version:              lang.version,
      files:                [{ name: `solution.${ext}`, content: code }],
      stdin,
      args:                 [],
      compile_timeout:      10_000,
      run_timeout:          5_000,
      compile_memory_limit: -1,
      run_memory_limit:     -1,
    }),
  });

  if (!res.ok) {
    throw new Error(`Piston error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<RunOutput>;
}

// ── Test-case runner ───────────────────────────────────────────

export async function runTestCases(
  language: string,
  code: string,
  testCases: Array<{ input: string; expectedOutput: string; hidden?: boolean }>
): Promise<{ passed: number; total: number; results: TestResult[] }> {
  const results: TestResult[] = [];
  let   passed = 0;

  for (const tc of testCases) {
    const start = Date.now();
    try {
      const out    = await executeCode(language, code, tc.input);
      const actual = out.run.stdout.trim();
      const ok     = actual === tc.expectedOutput.trim();
      if (ok) passed++;

      results.push({
        input:    tc.hidden ? "(hidden)" : tc.input,
        expected: tc.hidden ? "(hidden)" : tc.expectedOutput,
        actual:   ok || !tc.hidden ? actual : "(hidden)",
        passed:   ok,
        runtime:  Date.now() - start,
        stderr:   out.run.stderr || undefined,
        hidden:   tc.hidden,
      });
    } catch {
      results.push({
        input:    tc.hidden ? "(hidden)" : tc.input,
        expected: tc.hidden ? "(hidden)" : tc.expectedOutput,
        actual:   "Runtime Error",
        passed:   false,
        hidden:   tc.hidden,
      });
    }
  }

  return { passed, total: testCases.length, results };
}

// ── Helpers ────────────────────────────────────────────────────

function getExtension(language: string): string {
  const map: Record<string, string> = {
    javascript: "js",   typescript: "ts", python: "py",
    java:       "java", cpp:        "cpp", c:     "c",
    go:         "go",   rust:       "rs",  kotlin: "kt",
    php:        "php",  ruby:       "rb",  csharp: "cs",
    bash:       "sh",
  };
  return map[language] ?? "txt";
}
