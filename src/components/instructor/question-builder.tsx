// ─────────────────────────────────────────────────────────────
//  src/components/instructor/question-builder.tsx
//  Manage assessments + questions for a certification.
//  Used inside the Course Editor "Assessments" tab.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, Loader2, ClipboardList, ChevronDown, ChevronUp, Edit2,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const QUESTION_TYPES = [
  { value: "MCQ",        label: "Multiple Choice (single answer)" },
  { value: "MSQ",        label: "Multiple Select (multi-answer)"  },
  { value: "TRUE_FALSE", label: "True / False"                     },
  { value: "FILL_BLANK", label: "Fill in the Blank"                },
];

interface Props { certId: string }

export function QuestionBuilder({ certId }: Props) {
  const { toast } = useToast();
  const qc        = useQueryClient();

  const [showAssessDialog, setShowAssessDialog] = useState(false);
  const [expandedId, setExpandedId]              = useState<string | null>(null);

  // New assessment form
  const [aTitle, setATitle]       = useState("");
  const [aType,  setAType]        = useState<"QUIZ" | "CERTIFICATION_EXAM" | "PRACTICE">("QUIZ");
  const [aPass,  setAPass]        = useState(70);
  const [aTime,  setATime]        = useState<number | "">("");

  const { data, isLoading } = useQuery({
    queryKey: ["assessments", certId],
    queryFn:  async () => {
      const r = await fetch(`/api/certifications/${certId}/assessments`);
      return r.json();
    },
  });

  const assessments = data?.data ?? [];

  const createAssessment = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/certifications/${certId}/assessments`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: aTitle, type: aType, passMark: aPass,
          timeLimit: aTime === "" ? null : Number(aTime),
        }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Assessment created!" });
      setShowAssessDialog(false);
      setATitle(""); setAPass(70); setATime("");
      qc.invalidateQueries({ queryKey: ["assessments", certId] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Create quizzes for practice and one certification exam for the final test.
        </p>
        <Button size="sm" variant="gradient" className="gap-1.5" onClick={() => setShowAssessDialog(true)}>
          <Plus className="w-3.5 h-3.5" /> New Assessment
        </Button>
      </div>

      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      ) : assessments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No assessments yet. Create your first quiz or certification exam.
        </p>
      ) : (
        <div className="space-y-3">
          {assessments.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="pt-4">
                <button
                  className="w-full flex items-center gap-3 text-left"
                  onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                >
                  <ClipboardList className="w-4 h-4 text-violet-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a._count.questions} questions · Pass: {a.passMark}%
                      {a.timeLimit ? ` · ${a.timeLimit} min` : ""}
                    </p>
                  </div>
                  <Badge variant={a.type === "CERTIFICATION_EXAM" ? "default" : "secondary"}>
                    {a.type === "CERTIFICATION_EXAM" ? "Final Exam" : a.type}
                  </Badge>
                  {expandedId === a.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {expandedId === a.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <QuestionList assessmentId={a.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Assessment Dialog */}
      <Dialog open={showAssessDialog} onOpenChange={setShowAssessDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Assessment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder="e.g. Chapter 1 Quiz" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={aType} onValueChange={(v) => setAType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUIZ">Practice Quiz</SelectItem>
                    <SelectItem value="PRACTICE">Practice (ungraded)</SelectItem>
                    <SelectItem value="CERTIFICATION_EXAM">Certification Exam (final)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Pass Mark (%)</Label>
                <Input type="number" min={0} max={100} value={aPass} onChange={(e) => setAPass(Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Time Limit (minutes, optional)</Label>
              <Input type="number" min={1} value={aTime} onChange={(e) => setATime(e.target.value === "" ? "" : Number(e.target.value))} placeholder="No limit" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAssessDialog(false)}>Cancel</Button>
            <Button variant="gradient" onClick={() => createAssessment.mutate()} disabled={!aTitle.trim() || createAssessment.isPending}>
              {createAssessment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Questions inside an assessment
// ─────────────────────────────────────────────────────────────
function QuestionList({ assessmentId }: { assessmentId: string }) {
  const { toast } = useToast();
  const qc        = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["questions", assessmentId],
    queryFn:  async () => {
      const r = await fetch(`/api/assessments/${assessmentId}/questions`);
      return r.json();
    },
  });
  const questions = data?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/questions/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error((await r.json()).error);
    },
    onSuccess: () => {
      toast({ title: "Question removed" });
      qc.invalidateQueries({ queryKey: ["questions", assessmentId] });
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{questions.length} questions</p>
        <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => setShowAdd(true)}>
          <Plus className="w-3 h-3" /> Add Question
        </Button>
      </div>

      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : questions.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No questions yet</p>
      ) : (
        <div className="space-y-2">
          {questions.map((q: any, i: number) => (
            <div key={q.id} className="flex items-start gap-2 p-2.5 rounded-lg border border-border text-xs">
              <span className="w-5 h-5 rounded bg-muted flex items-center justify-center font-medium shrink-0">{i + 1}</span>
              <div className="flex-1">
                <p className="font-medium">{q.body}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[9px]">{q.type}</Badge>
                  <Badge variant="outline" className="text-[9px]">{q.points} pt{q.points !== 1 ? "s" : ""}</Badge>
                  <span className="text-emerald-400">✓ {formatAnswer(q)}</span>
                </div>
              </div>
              <Button
                size="icon" variant="ghost" className="h-6 w-6 shrink-0"
                onClick={() => deleteMutation.mutate(q.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AddQuestionDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        assessmentId={assessmentId}
        onAdded={() => qc.invalidateQueries({ queryKey: ["questions", assessmentId] })}
      />
    </div>
  );
}

function formatAnswer(q: any): string {
  if (q.type === "MSQ") {
    try { return (JSON.parse(q.answer) as string[]).join(", "); } catch { return q.answer; }
  }
  if (q.type === "TRUE_FALSE") return q.answer === "true" ? "True" : "False";
  if (q.options) {
    const opt = (q.options as any[]).find((o) => o.value === q.answer);
    return opt?.label ?? q.answer;
  }
  return q.answer;
}

// ─────────────────────────────────────────────────────────────
//  Add Question Dialog — supports MCQ / MSQ / TRUE_FALSE / FILL_BLANK
// ─────────────────────────────────────────────────────────────
function AddQuestionDialog({
  open, onClose, assessmentId, onAdded,
}: {
  open:         boolean;
  onClose:      () => void;
  assessmentId: string;
  onAdded:      () => void;
}) {
  const { toast } = useToast();

  const [type, setType]        = useState<"MCQ" | "MSQ" | "TRUE_FALSE" | "FILL_BLANK">("MCQ");
  const [body, setBody]        = useState("");
  const [options, setOptions]  = useState(["", "", "", ""]);
  const [correct, setCorrect]  = useState<string>("");      // MCQ/TF/FILL_BLANK
  const [correctMulti, setCorrectMulti] = useState<string[]>([]); // MSQ
  const [explanation, setExplanation]   = useState("");
  const [points, setPoints]    = useState(1);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setType("MCQ"); setBody(""); setOptions(["", "", "", ""]);
    setCorrect(""); setCorrectMulti([]); setExplanation(""); setPoints(1);
  }

  async function submit() {
    if (!body.trim()) { toast({ title: "Question body required", variant: "destructive" }); return; }

    let payload: any = { type, body, explanation: explanation || undefined, points };

    if (type === "MCQ") {
      const opts = options.filter((o) => o.trim()).map((label, i) => ({ label, value: String.fromCharCode(97 + i) }));
      if (opts.length < 2 || !correct) { toast({ title: "Add options and select the correct one", variant: "destructive" }); return; }
      payload.options = opts;
      payload.answer  = correct;
    } else if (type === "MSQ") {
      const opts = options.filter((o) => o.trim()).map((label, i) => ({ label, value: String.fromCharCode(97 + i) }));
      if (opts.length < 2 || correctMulti.length === 0) { toast({ title: "Add options and select correct answers", variant: "destructive" }); return; }
      payload.options = opts;
      payload.answer  = JSON.stringify(correctMulti);
    } else if (type === "TRUE_FALSE") {
      if (!correct) { toast({ title: "Select True or False", variant: "destructive" }); return; }
      payload.options = [{ label: "True", value: "true" }, { label: "False", value: "false" }];
      payload.answer  = correct;
    } else {
      // FILL_BLANK
      if (!correct.trim()) { toast({ title: "Enter the correct answer", variant: "destructive" }); return; }
      payload.answer = correct.trim();
    }

    setSubmitting(true);
    try {
      const r = await fetch(`/api/assessments/${assessmentId}/questions`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      toast({ title: "Question added!" });
      reset();
      onAdded();
      onClose();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Question</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Question Type</Label>
            <Select value={type} onValueChange={(v) => { setType(v as any); setCorrect(""); setCorrectMulti([]); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Question</Label>
            <Textarea rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What is...?" />
          </div>

          {(type === "MCQ" || type === "MSQ") && (
            <div className="space-y-2">
              <Label>Options {type === "MSQ" ? "(check all correct)" : "(select correct)"}</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  {type === "MCQ" ? (
                    <input
                      type="radio" name="correct"
                      checked={correct === String.fromCharCode(97 + i)}
                      onChange={() => setCorrect(String.fromCharCode(97 + i))}
                      className="w-4 h-4 accent-primary shrink-0"
                    />
                  ) : (
                    <Checkbox
                      checked={correctMulti.includes(String.fromCharCode(97 + i))}
                      onCheckedChange={(checked) => {
                        const val = String.fromCharCode(97 + i);
                        setCorrectMulti((prev) => checked ? [...prev, val] : prev.filter((v) => v !== val));
                      }}
                    />
                  )}
                  <Input
                    value={opt}
                    onChange={(e) => setOptions((prev) => prev.map((o, idx) => idx === i ? e.target.value : o))}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                </div>
              ))}
            </div>
          )}

          {type === "TRUE_FALSE" && (
            <div className="space-y-1.5">
              <Label>Correct Answer</Label>
              <div className="flex gap-2">
                {["true", "false"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setCorrect(v)}
                    className={`flex-1 py-2 rounded-lg border text-sm capitalize ${correct === v ? "border-primary bg-primary/10" : "border-border"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === "FILL_BLANK" && (
            <div className="space-y-1.5">
              <Label>Correct Answer</Label>
              <Input value={correct} onChange={(e) => setCorrect(e.target.value)} placeholder="Expected answer (case-insensitive)" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Points</Label>
              <Input type="number" min={1} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Explanation (shown after submission, optional)</Label>
            <Textarea rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Why is this the correct answer?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="gradient" onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

