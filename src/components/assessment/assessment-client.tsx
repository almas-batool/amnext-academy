// ─────────────────────────────────────────────────────────────
//  src/components/assessment/assessment-client.tsx
//  Quiz/practice assessment — reusable timed question engine.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Attempt = {
  id: string;
  score: number;
  passed: boolean;
  completedAt: string | null;
};

type Question = {
  id: string;
  type: string;
  body: string;
  options: { label: string; value: string }[] | null;
  points: number;
};

type GradeResult = {
  score: number;
  passed: boolean;
  passMark: number;
  gradedAnswers: Record<string, { correct: boolean; explanation?: string }>;
  certificate?: { certificateId: string; pdfUrl: string } | null;
};

interface Props {
  assessmentId: string;
  certId: string;
  title: string;
  type: string;
  passMark: number;
  timeLimit: number | null;
  questionCount: number;
  maxAttempts: number | null;
  attempts: Attempt[];
}

export function AssessmentClient({
  assessmentId,
  certId,
  title,
  type,
  passMark,
  timeLimit,
  questionCount,
  maxAttempts,
  attempts,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [phase, setPhase] = useState<"intro" | "active" | "result">("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState((timeLimit ?? 30) * 60);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const attemptsLeft = maxAttempts ? maxAttempts - attempts.length : null;
  const bestScore = attempts.length
    ? Math.max(...attempts.map((a) => a.score))
    : null;

  // Load questions when starting
  async function startAssessment() {
    setLoading(true);
    try {
      const r = await fetch(`/api/assessments/${assessmentId}`);
      const json = await r.json();
      if (!r.ok) throw new Error(json.error);
      setQuestions(json.data.questions);
      setPhase("active");
      setStartedAt(new Date());
      setTimeLeft((timeLimit ?? 30) * 60);
    } catch (e: any) {
      toast({
        title: "Failed to load assessment",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Timer
  useEffect(() => {
    if (phase !== "active") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          submitAnswers();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const submitAnswers = useCallback(async () => {
    if (submitting) return;
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const r = await fetch(`/api/assessments/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, startedAt }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error);
      setResult(json.data);
      setPhase("result");
    } catch (e: any) {
      toast({
        title: "Submission failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }, [submitting, assessmentId, answers, startedAt]);

  function select(qId: string, value: string, isMulti: boolean) {
    setAnswers((prev) => {
      if (!isMulti) return { ...prev, [qId]: value };
      const arr = (prev[qId] as string[]) ?? [];
      return {
        ...prev,
        [qId]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const pct = questions.length
    ? (Object.keys(answers).length / questions.length) * 100
    : 0;
  const q = questions[current];

  // ── Intro ────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="max-w-lg mx-auto py-12 space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            {questionCount} questions
            {timeLimit ? ` · ${timeLimit} minutes` : ""}
            {" · "}Pass: {passMark}%
          </p>
          {bestScore !== null && (
            <p className="text-sm">
              Best score:{" "}
              <span
                className={
                  bestScore >= passMark ? "text-emerald-400" : "text-red-400"
                }
              >
                {bestScore.toFixed(1)}%
              </span>
            </p>
          )}
          {attemptsLeft !== null && (
            <Badge variant={attemptsLeft > 0 ? "secondary" : "destructive"}>
              {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining
            </Badge>
          )}
        </div>

        {attemptsLeft !== null && attemptsLeft <= 0 ? (
          <div className="text-center space-y-3">
            <p className="text-destructive">No attempts remaining.</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go back
            </Button>
          </div>
        ) : (
          <Button
            onClick={startAssessment}
            disabled={loading}
            variant="gradient"
            className="w-full"
            size="lg"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Start Assessment
          </Button>
        )}

        {attempts.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-3">Previous attempts</p>
              <div className="space-y-2">
                {attempts.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      Attempt {attempts.length - i}
                    </span>
                    <span
                      className={a.passed ? "text-emerald-400" : "text-red-400"}
                    >
                      {a.score.toFixed(1)}%
                    </span>
                    <Badge
                      variant={a.passed ? ("success" as any) : "destructive"}
                      className="text-[10px]"
                    >
                      {a.passed ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Result ───────────────────────────────────────────────────
  if (phase === "result" && result) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6">
        <div className="text-center space-y-4">
          <div
            className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mx-auto ${result.passed ? "border-emerald-500 bg-emerald-500/10" : "border-red-500 bg-red-500/10"}`}
          >
            {result.passed ? (
              <Trophy className="w-10 h-10 text-emerald-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold">
            {result.passed ? "Passed! 🎉" : "Not quite there"}
          </h1>
          <p className="text-muted-foreground">
            Score:{" "}
            <span
              className={`font-bold text-xl ${result.passed ? "text-emerald-400" : "text-red-400"}`}
            >
              {result.score.toFixed(1)}%
            </span>
            <span className="text-sm ml-2">
              (Pass mark: {result.passMark}%)
            </span>
          </p>
        </div>

        {/* Per-question breakdown */}
        <div className="space-y-3">
          {questions.map((qq, i) => {
            const grade = result.gradedAnswers[qq.id];
            return (
              <Card
                key={qq.id}
                className={`border ${grade?.correct ? "border-emerald-500/20" : "border-red-500/20"}`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    {grade?.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        Q{i + 1}: {qq.body}
                      </p>
                      {!grade?.correct && grade?.explanation && (
                        <p className="text-xs text-muted-foreground mt-1">
                          💡 {grade.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            variant="outline"
            onClick={() => router.push(`/certifications/${certId}/learn`)}
          >
            Back to Course
          </Button>
          {(attemptsLeft === null || attemptsLeft > 0) && (
            <Button
              variant="secondary"
              className="gap-1.5"
              onClick={() => {
                setPhase("intro");
                setAnswers({});
                setCurrent(0);
                setResult(null);
              }}
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
          )}
          {type === "CERTIFICATION_EXAM" &&
            result.passed &&
            result.certificate && (
              <>
                <Button
                  variant="gradient"
                  onClick={() => {
                    if (!result.certificate) return;

                    router.push(
                      `/certificates/${result.certificate.certificateId}`,
                    );
                  }}
                >
                  View Certificate
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(result.certificate!.pdfUrl, "_blank")
                  }
                >
                  Download Certificate
                </Button>
              </>
            )}
        </div>
      </div>
    );
  }

  // ── Active exam ──────────────────────────────────────────────
  if (!q) return null;
  const isMulti = q.type === "MSQ";
  const answer = answers[q.id];

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {title} · Q {current + 1}/{questions.length}
        </p>
        {timeLimit && (
          <div
            className={`flex items-center gap-1.5 font-mono font-bold px-3 py-1.5 rounded-lg border text-sm ${timeLeft < 120 ? "border-red-500/50 bg-red-500/10 text-red-400 animate-pulse" : "border-border"}`}
          >
            <Clock className="w-3.5 h-3.5" /> {mm}:{ss}
          </div>
        )}
      </div>

      <Progress value={pct} className="h-1" />

      {/* Question */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="shrink-0 mt-0.5 text-xs">
              Q{current + 1}
            </Badge>
            <div>
              <p className="font-medium leading-relaxed">{q.body}</p>
              {isMulti && (
                <p className="text-xs text-muted-foreground mt-1">
                  Select all that apply
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {q.type === "FILL_BLANK" ? (
              <input
                className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your answer…"
                value={(answer as string) ?? ""}
                onChange={(e) =>
                  setAnswers((p) => ({ ...p, [q.id]: e.target.value }))
                }
              />
            ) : (
              (q.options ?? []).map((opt) => {
                const sel = isMulti
                  ? ((answer as string[]) ?? []).includes(opt.value)
                  : answer === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => select(q.id, opt.value, isMulti)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                      sel
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40 hover:bg-muted/40",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-5 h-5 rounded mr-3 border text-[10px] font-medium",
                        sel
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40",
                      )}
                    >
                      {isMulti ? (sel ? "✓" : "") : opt.label[0]}
                    </span>
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>

        <div className="flex gap-1 flex-wrap justify-center">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-7 h-7 rounded text-xs font-medium",
                i === current
                  ? "bg-primary text-primary-foreground"
                  : answers[questions[i].id]
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-muted text-muted-foreground hover:bg-accent",
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {current < questions.length - 1 ? (
          <Button
            variant="outline"
            onClick={() => setCurrent((c) => c + 1)}
            className="gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="gradient"
            onClick={submitAnswers}
            disabled={submitting}
            className="gap-1.5"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}

