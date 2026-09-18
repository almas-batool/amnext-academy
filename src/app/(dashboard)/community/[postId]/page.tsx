// src/app/(dashboard)/community/[postId]/page.tsx
// Individual post with replies.
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ArrowLeft, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/utils";

export default function PostPage() {
  const { postId }  = useParams<{ postId: string }>();
  const router      = useRouter();
  const { toast }   = useToast();
  const qc          = useQueryClient();
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn:  async () => {
      const r = await fetch(`/api/community/posts/${postId}/replies`);
      return r.json();
    },
  });
  const post = data?.data;

  async function submitReply() {
    if (!reply.trim()) return;
    setSubmitting(true);
    const res  = await fetch(`/api/community/posts/${postId}/replies`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ body: reply }),
    });
    const json = await res.json();
    if (!res.ok) { toast({ title: "Error", description: json.error, variant: "destructive" }); }
    else { setReply(""); qc.invalidateQueries({ queryKey: ["post", postId] }); }
    setSubmitting(false);
  }

  if (isLoading) return (
    <div className="max-w-3xl space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );

  if (!post) return <div className="text-center py-20 text-muted-foreground">Post not found</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      {/* Post */}
      <div className="rounded-xl border border-border p-6 space-y-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback>{(post.user?.name ?? "U")[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{post.user?.name ?? "Anonymous"}</span>
              {post.user?.role !== "STUDENT" && (
                <Badge variant="secondary" className="text-[10px]">{post.user?.role}</Badge>
              )}
              <span className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
            </div>
            <h1 className="text-xl font-bold mb-3">{post.title}</h1>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{post.body}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(post.tags ?? []).map((t: string) => (
                <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 pt-2 border-t border-border text-muted-foreground text-sm">
          <ThumbsUp className="w-4 h-4" /> {post.upvotes} upvotes ·
          <MessageSquare className="w-4 h-4 ml-2" /> {post.replies?.length ?? 0} replies
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">{post.replies?.length ?? 0} Replies</h2>
        {(post.replies ?? []).map((r: any) => (
          <div key={r.id} className={`rounded-xl border p-5 flex gap-3 ${r.accepted ? "border-emerald-500/40 bg-emerald-500/5" : "border-border"}`}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">{(r.user?.name ?? "U")[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{r.user?.name ?? "Anonymous"}</span>
                {r.accepted && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accepted answer
                  </span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">{formatRelativeTime(r.createdAt)}</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply input */}
      <div className="space-y-3">
        <h3 className="font-medium">Your reply</h3>
        <Textarea
          placeholder="Share your thoughts or answer…"
          rows={4}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <Button onClick={submitReply} variant="gradient" disabled={submitting || !reply.trim()}>
          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Post reply
        </Button>
      </div>
    </div>
  );
}
