// src/components/gamification/xp-bar.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Progress } from "@/components/ui/progress";
import { Zap }      from "lucide-react";
import { getLevelFromXP } from "@/lib/utils";

export function XPBar() {
  const { data: session } = useSession();

  const { data } = useQuery({
    queryKey: ["xp", session?.user?.id],
    queryFn:  async () => {
      const r = await fetch("/api/gamification/xp");
      return r.json();
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30_000,
  });

  const profile   = data?.data;
  const xp        = profile?.xp ?? 0;
  const levelInfo = getLevelFromXP(xp);

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
      <Zap className="w-4 h-4 text-amber-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-semibold text-amber-400">
            Lv {levelInfo.level} · {levelInfo.title}
          </span>
          <span className="text-muted-foreground">{xp.toLocaleString()} XP</span>
        </div>
        <Progress value={levelInfo.progress} className="h-1" />
      </div>
    </div>
  );
}

