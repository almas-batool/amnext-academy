// src/components/gamification/leaderboard.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge }    from "@/components/ui/badge";
import { Button }   from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Period = "all" | "weekly" | "monthly";

export function Leaderboard() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<Period>("weekly");

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn:  async () => {
      const r = await fetch(`/api/gamification/leaderboard?period=${period}`);
      return r.json();
    },
  });

  const leaders = data?.data ?? [];
  const rankIcon = (rank: number) =>
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" /> Leaderboard
        </CardTitle>
        <div className="flex gap-2 mt-2">
          {(["weekly","monthly","all"] as Period[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "secondary" : "ghost"}
              className="h-7 text-xs capitalize"
              onClick={() => setPeriod(p)}
            >
              {p === "all" ? "All Time" : p}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
          : leaders.slice(0, 20).map((entry: any, i: number) => {
              const rank   = i + 1;
              const isMe   = entry.userId === session?.user?.id || entry.user?.id === session?.user?.id;
              const name   = entry.user?.name ?? "Anonymous";
              const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

              return (
                <div
                  key={entry.userId ?? i}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
                    isMe    ? "bg-primary/10 border border-primary/20"
                    : rank <= 3 ? "bg-amber-500/5"
                    : "hover:bg-muted/50"
                  )}
                >
                  <span className="w-8 text-center text-sm font-bold shrink-0">
                    {rankIcon(rank)}
                  </span>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={entry.user?.image} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className={cn("flex-1 text-sm font-medium truncate", isMe && "text-primary")}>
                    {name} {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                  </span>
                  <span className="text-sm font-bold text-amber-400 shrink-0">
                    {(entry.xp ?? entry.profile?.xp ?? 0).toLocaleString()} XP
                  </span>
                </div>
              );
            })}
        {!isLoading && leaders.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No activity in this period yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
