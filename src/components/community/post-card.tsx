// src/components/community/post-card.tsx
"use client";

import Link from "next/link";
import { MessageSquare, ThumbsUp, Eye } from "lucide-react";
import { Badge }    from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { cn }   from "@/lib/utils";

interface Post {
  id:        string;
  title:     string;
  body:      string;
  tags:      string[];
  upvotes:   number;
  views?:    number;
  createdAt: string;
  pinned?:   boolean;
  user:      { name: string | null; image?: string | null };
  _count?:   { replies: number };
}

export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  const initials = (post.user.name ?? "U")[0].toUpperCase();

  return (
    <Link href={`/community/${post.id}`}>
      <div className={cn(
        "p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer",
        post.pinned && "border-amber-500/30 bg-amber-500/5"
      )}>
        <div className="flex items-start gap-3">
          {/* Vote count */}
          <div className="flex flex-col items-center text-center gap-0.5 shrink-0 w-10">
            <ThumbsUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{post.upvotes}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {post.pinned && (
                <Badge variant="warning" className="text-[9px] py-0">📌 Pinned</Badge>
              )}
              {post.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>
              ))}
            </div>

            <h3 className="font-medium text-foreground line-clamp-1 hover:text-primary transition-colors">
              {post.title}
            </h3>

            {!compact && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {post.body}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
                </Avatar>
                {post.user.name ?? "Anonymous"}
              </span>
              <span>{formatRelativeTime(post.createdAt)}</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {post._count?.replies ?? 0}
              </span>
              {post.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {post.views}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

