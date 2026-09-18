// ─────────────────────────────────────────────────────────────
//  src/app/(dashboard)/community/page.tsx
//  Community forum — list posts, filter, create.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus, ThumbsUp, Search, Tag, Loader2, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/utils";

const postSchema = z.object({
  title: z.string().min(5),
  body:  z.string().min(10),
  tags:  z.string().optional(),
});
type PostForm = z.infer<typeof postSchema>;

export default function CommunityPage() {
  const { toast }       = useToast();
  const qc              = useQueryClient();
  const [search, setSearch]       = useState("");
  const [sort,   setSort]         = useState<"latest" | "top">("latest");
  const [showNew, setShowNew]     = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["posts", search, sort],
    queryFn:  async () => {
      const p = new URLSearchParams({ search, sort });
      const r = await fetch(`/api/community/posts?${p}`);
      return r.json();
    },
  });
  const posts = data?.items ?? [];

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
  });

  const createPost = async (form: PostForm) => {
    const tags = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const res  = await fetch("/api/community/posts", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ title: form.title, body: form.body, tags }),
    });
    const json = await res.json();
    if (!res.ok) { toast({ title: "Error", description: json.error, variant: "destructive" }); return; }
    toast({ title: "Post created!" });
    setShowNew(false);
    reset();
    qc.invalidateQueries({ queryKey: ["posts"] });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground mt-1">Ask, discuss, and help others</p>
        </div>
        <Button onClick={() => setShowNew(true)} variant="gradient" className="gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search discussions…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["latest", "top"] as const).map((s) => (
            <Button key={s} size="sm" variant={sort === s ? "secondary" : "outline"} onClick={() => setSort(s)} className="gap-1.5">
              {s === "latest" ? <Clock className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              {s === "latest" ? "Latest" : "Top"}
            </Button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No posts yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => (
            <Link key={post.id} href={`/community/${post.id}`}>
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="py-4 flex gap-4">
                  <div className="flex flex-col items-center gap-1 text-center shrink-0 w-10">
                    <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{post.upvotes}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium hover:text-primary transition-colors line-clamp-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{post.body}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span>{post.user?.name ?? "Anonymous"}</span>
                      <span>{formatRelativeTime(post.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {post._count?.replies ?? 0}
                      </span>
                      {(post.tags ?? []).slice(0, 3).map((t: string) => (
                        <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* New Post Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a new post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(createPost)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="What's your question or discussion?" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Body</label>
              <Textarea placeholder="Describe in detail…" rows={5} {...register("body")} />
              {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Tags (comma-separated)</label>
              <Input placeholder="javascript, react, async" {...register("tags")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Publish
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

