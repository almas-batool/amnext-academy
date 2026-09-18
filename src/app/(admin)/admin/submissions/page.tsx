// ─────────────────────────────────────────────────────────────
//  src/app/(admin)/admin/submissions/page.tsx
//  Instructor content approval queue.
// ─────────────────────────────────────────────────────────────
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Clock, Loader2, Eye } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Badge }    from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

export default function SubmissionsPage() {
  const { toast } = useToast();
  const qc        = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [note,     setNote]     = useState("");
  const [action,   setAction]   = useState<"approve" | "reject" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-submissions"],
    queryFn:  async () => {
      const r = await fetch("/api/admin/submissions");
      return r.json();
    },
  });

  const submissions = data?.data ?? [];
  const pending     = submissions.filter((s: any) => s.status === "PENDING_REVIEW");
  const reviewed    = submissions.filter((s: any) => s.status !== "PENDING_REVIEW");

  async function handleAction() {
    if (!selected || !action) return;
    const url = `/api/admin/submissions/${selected.id}/${action}`;
    const res  = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ note }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast({ title: "Error", description: json.error, variant: "destructive" });
    } else {
      toast({ title: action === "approve" ? "✅ Approved!" : "Rejected", variant: "success" as any });
      qc.invalidateQueries({ queryKey: ["admin-submissions"] });
    }
    setSelected(null);
    setNote("");
    setAction(null);
  }

  function openAction(sub: any, act: "approve" | "reject") {
    setSelected(sub);
    setAction(act);
    setNote("");
  }

  const SubmissionRow = ({ sub }: { sub: any }) => (
    <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
      <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${sub.status === "PENDING_REVIEW" ? "bg-amber-400" : sub.status === "APPROVED" ? "bg-emerald-400" : "bg-red-400"}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{sub.cert?.title ?? "—"}</p>
        <p className="text-xs text-muted-foreground">
          by {sub.instructor?.name ?? sub.instructor?.email} · Submitted {formatDate(sub.createdAt)}
        </p>
        {sub.adminNote && (
          <p className="text-xs text-muted-foreground mt-1 italic">Note: {sub.adminNote}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={
          sub.status === "PENDING_REVIEW" ? "warning"  :
          sub.status === "APPROVED"       ? "success"  : "destructive"
        } className="text-[10px]">
          {sub.status.replace("_", " ")}
        </Badge>
        {sub.status === "PENDING_REVIEW" && (
          <>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => openAction(sub, "approve")}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={() => openAction(sub, "reject")}>
              <XCircle className="w-3.5 h-3.5" /> Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Submissions</h1>
        <p className="text-muted-foreground mt-1">Review and approve instructor-submitted content</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Pending Review ({pending.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pending.length === 0
                ? <p className="text-sm text-muted-foreground py-4">No pending submissions</p>
                : pending.map((s: any) => <SubmissionRow key={s.id} sub={s} />)}
            </CardContent>
          </Card>

          {reviewed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recently Reviewed ({reviewed.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewed.slice(0, 10).map((s: any) => <SubmissionRow key={s.id} sub={s} />)}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Review dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setAction(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Submission" : "Reject Submission"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Course: <span className="font-medium text-foreground">{selected?.cert?.title}</span>
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Note to instructor (optional)</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={action === "approve" ? "Great course! Ready to publish." : "Please review the following…"}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setSelected(null); setAction(null); }}>Cancel</Button>
            <Button
              variant={action === "approve" ? "gradient" : "destructive"}
              onClick={handleAction}
            >
              {action === "approve" ? "Approve & Publish" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

