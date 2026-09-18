// src/components/community/reply-thread.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge }    from "@/components/ui/badge";
import { Button }   from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cn }   from "@/lib/utils";

interface Reply {
  id:        string;
  body:      string;
  upvotes:   number;
  accepted:  boolean;
  createdAt: string;
  user:      { name: string | null; role: string };
}

interface Props {
  replies:    Reply[];
  postId:     string;
  postUserId: string;
}

export function ReplyThread({ replies, postId, postUserId }: Props) {
  const { data: session } = useSession();
  const { toast }         = useToast();
  const qc                = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: async (replyId: string) => {
      const r = await fetch(`/api/community/replies/${replyId}/accept`, { method: "POST" });
      if (!r.ok) throw new Error((await r.json()).error);
    },
    onSuccess: () => {
      toast({ title: "Answer accepted! ⭐" });
      qc.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (replies.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">No replies yet. Be the first!</p>;
  }

  return (
    <div className="space-y-4">
      {replies.map((r) => {
        const initials = (r.user.name ?? "U")[0].toUpperCase();
        const isAuthor = session?.user?.id === postUserId;

        return (
          <div
            key={r.id}
            className={cn(
              "rounded-xl border p-5",
              r.accepted ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-card"
            )}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-sm font-medium">{r.user.name ?? "Anonymous"}</span>
                  {r.user.role !== "STUDENT" && (
                    <Badge variant="secondary" className="text-[9px]">{r.user.role}</Badge>
                  )}
                  {r.accepted && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Accepted
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatRelativeTime(r.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {r.body}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ThumbsUp className="w-3 h-3" /> {r.upvotes}
                  </span>
                  {isAuthor && !r.accepted && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-[10px] gap-1 text-emerald-400 border-emerald-500/30"
                      onClick={() => acceptMutation.mutate(r.id)}
                      disabled={acceptMutation.isPending}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Mark as answer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
