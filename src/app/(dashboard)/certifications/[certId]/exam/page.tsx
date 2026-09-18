// ─────────────────────────────────────────────────────────────
//  src/app/(dashboard)/certifications/[certId]/exam/page.tsx
//  Timed certification exam with anti-cheat detection.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Clock, ChevronLeft, ChevronRight, CheckCircle2,
  XCircle, Loader2, AlertTriangle, Trophy,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge }    from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Question = {
  id:      string;
  type:    string;
  body:    string;
  options: { label: string; value: string }[] | null;
  points:  number;
};

type ExamResult = {
  score:          number;
  passed:         boolean;
  certificate?:   { certificateId: string; pdfUrl: string } | null;
};

export default function ExamPage() {
  const { certId } = useParams<{ certId: string }>();
  const router     = useRouter();
  const { toast }  = useToast();

  // Fetch the certification exam assessment
  const { data: certData } = useQuery({
    queryKey: ["cert-exam", certId],
    queryFn:  async () => {
      const r = await fetch(`/api/certifications/${certId}`);
      return r.json();
    },
  });

  const examAssessment = certData?.data?.assessments?.find(
    (a: any) => a.type === "CERTIFICATION_EXAM"
  );

  const { data: examData, isLoading } = useQuery({
    queryKey:  ["exam-questions", examAssessment?.id],
    queryFn:   async () => {
      const r = await fetch(`/api/assessments/${examAssessment!.id}`);
      return r.json();
    },
    enabled:   !!examAssessment?.id,
  });

  const exam      = examData?.data;
  const questions: Question[] = exam?.questions ?? [];
  const timeLimit = (exam?.timeLimit ?? 60) * 60; // seconds

  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState<Record<string, string | string[]>>({});
  const [timeLeft,  setTimeLeft]  = useState(timeLimit);
  const [started,   setStarted]   = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [result,    setResult]    = useState<ExamResult | null>(null);
  const [submitting,setSubmitting]= useState(false);
  const [warnings,  setWarnings]  = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Anti-cheat: tab visibility
  useEffect(() => {
    if (!started) return;
    const onBlur = () => {
      setWarnings((w) => {
        const next = w + 1;
        toast({
          title:       `⚠️ Warning ${next}/3`,
          description: "Leaving the exam tab is recorded. 3 warnings = auto-submit.",
          variant:     "destructive",
        });
        if (next >= 3) handleSubmit();
        return next;
      });
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [started]);

  // Countdown timer
  useEffect(() => {
    if (!started || result) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, result]);

  const handleSubmit = useCallback(async () => {
    if (submitting || !exam || !examAssessment) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const res  = await fetch(`/api/assessments/${examAssessment.id}/submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ answers, startedAt }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Submission error", description: json.error, variant: "destructive" });
      } else {
        setResult(json.data);
      }
    } finally {
      setSubmitting(false);
    }
  }, [submitting, exam, examAssessment, answers, startedAt]);

  function selectAnswer(qId: string, value: string, isMulti: boolean) {
    setAnswers((prev) => {
      if (!isMulti) return { ...prev, [qId]: value };
      const existing = (prev[qId] as string[]) ?? [];
      return {
        ...prev,
        [qId]: existing.includes(value)
          ? existing.filter((v) => v !== value)
          : [...existing, value],
      };
    });
  }

  const mm   = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss   = String(timeLeft % 60).padStart(2, "0");
  const pct  = questions.length > 0
    ? (Object.keys(answers).length / questions.length) * 100
    : 0;

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading || !certData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!examAssessment) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No exam available</h2>
        <p className="text-muted-foreground mb-4">
          This certification does not have a final exam yet.
        </p>
        <Button onClick={() => router.back()} variant="outline">Go back</Button>
      </div>
    );
  }

  // ── Result screen ────────────────────────────────────────────
  if (result) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4 ${result.passed ? "border-emerald-500 bg-emerald-500/10" : "border-red-500 bg-red-500/10"}`}>
          {result.passed
            ? <Trophy   className="w-10 h-10 text-emerald-400" />
            : <XCircle  className="w-10 h-10 text-red-400" />}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {result.passed ? "🎉 Congratulations!" : "Better luck next time"}
          </h1>
          <p className="text-muted-foreground">
            You scored{" "}
            <span className={`font-bold text-lg ${result.passed ? "text-emerald-400" : "text-red-400"}`}>
              {result.score.toFixed(1)}%
            </span>
            {" "}(pass mark: {exam?.passMark}%)
          </p>
        </div>
        {result.passed && result.certificate && (
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="pt-5 space-y-3">
              <p className="font-semibold text-emerald-400">Your certificate is ready!</p>
              <p className="text-sm text-muted-foreground font-mono">
                ID: {result.certificate.certificateId}
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline" size="sm">
                  <a href={result.certificate.pdfUrl} target="_blank" rel="noopener noreferrer">
                    Download Certificate
                  </a>
                </Button>
                <Button asChild variant="gradient" size="sm">
                  <a href={`/verify/${result.certificate.certificateId}`}>
                    View & Share
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push(`/certifications/${certId}`)}>
            Back to Course
          </Button>
          <Button variant="gradient" onClick={() => router.push("/certificates")}>
            My Certificates
          </Button>
        </div>
      </div>
    );
  }

  // ── Pre-start screen ─────────────────────────────────────────
  if (!started) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Clock className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{exam?.title ?? "Certification Exam"}</h1>
          <p className="text-muted-foreground">
            {questions.length} questions · {exam?.timeLimit ?? 60} minutes · Pass: {exam?.passMark}%
          </p>
        </div>
        <Card>
          <CardContent className="pt-5 text-left space-y-3">
            {[
              "You cannot pause the exam once started.",
              "Leaving the tab 3 times will auto-submit.",
              "Answer all questions before submitting.",
              "Your certificate is generated instantly on pass.",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                {rule}
              </div>
            ))}
          </CardContent>
        </Card>
        <Button
          size="xl"
          variant="gradient"
          onClick={() => { setStarted(true); setStartedAt(new Date()); }}
          className="w-full"
        >
          Start Exam
        </Button>
      </div>
    );
  }

  // ── Active exam ──────────────────────────────────────────────
  const q      = questions[current];
  const isMulti = q?.type === "MSQ";
  const answered = answers[q?.id ?? ""];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{exam?.title}</p>
          <p className="text-sm text-muted-foreground">
            Q {current + 1} of {questions.length} ·{" "}
            {Object.keys(answers).length} answered
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg ${timeLeft < 120 ? "border-red-500/50 bg-red-500/10 text-red-400 animate-pulse" : "border-border"}`}>
          <Clock className="w-4 h-4" />
          {mm}:{ss}
        </div>
      </div>

      {/* Progress */}
      <Progress value={pct} className="h-1.5" />

      {/* Question */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-0.5">Q{current + 1}</Badge>
            <div className="space-y-1">
              <p className="font-medium leading-relaxed">{q?.body}</p>
              {isMulti && (
                <p className="text-xs text-muted-foreground">Select all that apply</p>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {(q?.options ?? []).map((opt) => {
              const sel = isMulti
                ? ((answered as string[]) ?? []).includes(opt.value)
                : answered === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => selectAnswer(q.id, opt.value, isMulti)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                    sel
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  )}
                >
                  <span className={cn(
                    "inline-flex items-center justify-center w-5 h-5 rounded mr-3 border text-xs font-medium",
                    sel
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40"
                  )}>
                    {isMulti ? (sel ? "✓" : "") : opt.value.toUpperCase()[0]}
                  </span>
                  {opt.label}
                </button>
              );
            })}
            {q?.type === "FILL_BLANK" && (
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your answer…"
                value={(answered as string) ?? ""}
                onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
              />
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
          className="gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        {/* Jump dots */}
        <div className="hidden md:flex gap-1.5 flex-wrap justify-center max-w-sm">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-7 h-7 rounded text-xs font-medium transition-colors",
                i === current
                  ? "bg-primary text-primary-foreground"
                  : answers[qq.id]
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-muted text-muted-foreground hover:bg-accent"
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
            className="gap-1.5"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="gradient"
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-1.5"
          >
            {submitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <CheckCircle2 className="w-4 h-4" />}
            Submit Exam
          </Button>
        )} 
      </div>

      {/* Warning indicator */}
      {warnings > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {warnings}/3 tab-switch warnings recorded
        </div>
      )}
    </div>
  );
}
