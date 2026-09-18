// ─────────────────────────────────────────────────────────────
//  src/components/workspace/assessments-panel.tsx
//  Lists quizzes / practice assessments / final exam for a
//  certification, with status badges and links to attempt.
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge }       from "@/components/ui/badge";
import { Button }      from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ClipboardList, Clock, CheckCircle2, XCircle, ArrowRight, Trophy,
} from "lucide-react";

export interface WorkspaceAssessment {
  id:          string;
  title:       string;
  type:        string; // QUIZ | PRACTICE | CERTIFICATION_EXAM
  passMark:    number;
  timeLimit:   number | null;
  maxAttempts: number | null;
  _count:      { questions: number };
  latestAttempt: { score: number; passed: boolean } | null;
}

interface Props {
  certId:      string;
  assessments: WorkspaceAssessment[];
}

export function AssessmentsPanel({ certId, assessments }: Props) {
  const quizzes = assessments.filter((a) => a.type !== "CERTIFICATION_EXAM");
  const exam    = assessments.find((a) => a.type === "CERTIFICATION_EXAM");

  if (assessments.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No assessments available for this course yet.</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {quizzes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
              Practice Quizzes
            </h3>
            <div className="space-y-2">
              {quizzes.map((a) => (
                <AssessmentCard key={a.id} certId={certId} assessment={a} />
              ))}
            </div>
          </div>
        )}

        {exam && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
              Certification Exam
            </h3>
            <AssessmentCard certId={certId} assessment={exam} isExam />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function AssessmentCard({
  certId, assessment, isExam = false,
}: { certId: string; assessment: WorkspaceAssessment; isExam?: boolean }) {
  const href = isExam
    ? `/certifications/${certId}/exam`
    : `/certifications/${certId}/assess/${assessment.id}`;

  const attempt = assessment.latestAttempt;

  return (
    <Card className={isExam ? "border-amber-500/30 bg-amber-500/5" : undefined}>
      <CardContent className="py-3.5 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isExam ? "bg-amber-500/15" : "bg-violet-500/15"}`}>
          {isExam
            ? <Trophy className="w-4.5 h-4.5 text-amber-400" />
            : <ClipboardList className="w-4.5 h-4.5 text-violet-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{assessment.title}</p>
          <p className="text-xs text-muted-foreground">
            {assessment._count.questions} questions
            {assessment.timeLimit ? ` · ${assessment.timeLimit} min` : ""}
            {" · "}Pass: {assessment.passMark}%
          </p>
        </div>

        {attempt && (
          <Badge variant={attempt.passed ? "success" : "destructive"} className="gap-1 text-[10px] shrink-0">
            {attempt.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {attempt.score.toFixed(0)}%
          </Badge>
        )}

        <Button asChild size="sm" variant={isExam ? "gradient" : "outline"} className="gap-1 shrink-0">
          <Link href={href}>
            {attempt ? "Retry" : "Start"} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

