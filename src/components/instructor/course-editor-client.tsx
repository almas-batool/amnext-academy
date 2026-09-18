// ─────────────────────────────────────────────────────────────
//  src/components/instructor/course-editor-client.tsx
//  Tabbed editor: Overview | Chapters | Assessments | Coding
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, GripVertical, Loader2, Save,
  BookOpen, ClipboardList, Code2, Send, ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { QuestionBuilder } from "@/components/instructor/question-builder";

interface Cert {
  id:              string;
  title:           string;
  description:     string;
  status:          string;
  price:           number | string;
  currency:        string;
  category:        string;
  difficulty:      string;
  chapters:        Array<{ id: string; title: string; order: number; content: string | null; pdfUrl: string | null }>;
  assessments:     Array<{ id: string; title: string; type: string; passMark: number; _count: { questions: number } }>;
  codingProblems:  Array<{ id: string; title: string; difficulty: string }>;
}

export function CourseEditorClient({ cert }: { cert: Cert }) {
  const router    = useRouter();
  const { toast } = useToast();
  const qc        = useQueryClient();

  const [title, setTitle]             = useState(cert.title);
  const [description, setDescription] = useState(cert.description);

  const [showChapterDialog, setShowChapterDialog] = useState(false);
  const [newChapterTitle, setNewChapterTitle]     = useState("");
  const [newChapterContent, setNewChapterContent] = useState("");

  const statusVariant: Record<string, any> = {
    PUBLISHED:      "success",
    PENDING_REVIEW: "warning",
    DRAFT:          "secondary",
    REJECTED:       "destructive",
  };

  // ── Save basic info ─────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/certifications/${cert.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, description }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
    },
    onSuccess: () => toast({ title: "Saved!" }),
    onError:   (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Add chapter ──────────────────────────────────────────────
  const addChapterMutation = useMutation({
    mutationFn: async () => {
      const order = cert.chapters.length + 1;
      const r = await fetch(`/api/certifications/${cert.id}/chapters`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title: newChapterTitle, order, content: newChapterContent }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Chapter added!" });
      setShowChapterDialog(false);
      setNewChapterTitle("");
      setNewChapterContent("");
      router.refresh();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Submit for review ────────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/certifications/${cert.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: "PENDING_REVIEW" }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
    },
    onSuccess: () => {
      toast({ title: "Submitted for review!" });
      router.refresh();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">{cert.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={statusVariant[cert.status] ?? "secondary"}>{cert.status.replace("_", " ")}</Badge>
            <Badge variant="secondary">{cert.category}</Badge>
            <Badge variant="outline">{cert.difficulty}</Badge>
            <span className="text-sm text-muted-foreground">
              {Number(cert.price) === 0 ? "Free" : formatCurrency(Number(cert.price), cert.currency)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <a href={`/certifications/${cert.id}`} target="_blank">
              <ExternalLink className="w-3.5 h-3.5" /> Preview
            </a>
          </Button>
          {cert.status === "DRAFT" && (
            <Button
              variant="gradient"
              size="sm"
              className="gap-1.5"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || cert.chapters.length === 0}
            >
              {submitMutation.isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />}
              Submit for Review
            </Button>
          )}
        </div>
      </div>

      {cert.status === "DRAFT" && cert.chapters.length === 0 && (
        <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
          Add at least one chapter before submitting for review.
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"    className="gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="chapters"    className="gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Chapters ({cert.chapters.length})</TabsTrigger>
          <TabsTrigger value="assessments" className="gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> Assessments ({cert.assessments.length})</TabsTrigger>
          <TabsTrigger value="coding"      className="gap-1.5"><Code2 className="w-3.5 h-3.5" /> Coding ({cert.codingProblems.length})</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="gap-1.5"
              >
                {saveMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chapters */}
        <TabsContent value="chapters">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Chapters</CardTitle>
              <Button size="sm" variant="gradient" className="gap-1.5" onClick={() => setShowChapterDialog(true)}>
                <Plus className="w-3.5 h-3.5" /> Add Chapter
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {cert.chapters.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No chapters yet. Add your first chapter to get started.
                </p>
              ) : (
                cert.chapters.map((ch, i) => (
                  <div key={ch.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">{ch.title}</span>
                    {ch.pdfUrl && <Badge variant="outline" className="text-[10px]">PDF</Badge>}
                    {ch.content && <Badge variant="secondary" className="text-[10px]">Notes</Badge>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments */}
        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Assessments &amp; Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionBuilder certId={cert.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coding */}
        <TabsContent value="coding">
          <Card>
            <CardHeader>
              <CardTitle>Coding Problems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cert.codingProblems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No coding problems linked to this course yet.
                </p>
              ) : (
                cert.codingProblems.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="flex-1 text-sm font-medium">{p.title}</span>
                    <Badge variant={
                      p.difficulty === "BEGINNER"     ? "success" :
                      p.difficulty === "INTERMEDIATE" ? "warning" : "destructive"
                    } className="text-[10px]">
                      {p.difficulty}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Chapter Dialog */}
      <Dialog open={showChapterDialog} onOpenChange={setShowChapterDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Chapter</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Chapter Title</Label>
              <Input
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="e.g. Introduction to Variables"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Content (Markdown)</Label>
              <Textarea
                rows={8}
                value={newChapterContent}
                onChange={(e) => setNewChapterContent(e.target.value)}
                placeholder="# Chapter Title&#10;&#10;Write your notes in markdown..."
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowChapterDialog(false)}>Cancel</Button>
            <Button
              variant="gradient"
              onClick={() => addChapterMutation.mutate()}
              disabled={addChapterMutation.isPending || !newChapterTitle.trim()}
            >
              {addChapterMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

