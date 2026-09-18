// src/components/gamification/badge-grid.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { BADGES }   from "@/config/constants";
import { cn }       from "@/lib/utils";

export function BadgeGrid() {
  const { data } = useQuery({
    queryKey: ["badges"],
    queryFn:  async () => {
      const r = await fetch("/api/gamification/badges");
      return r.json();
    },
  });

  const badgeData: Array<typeof BADGES[number] & { earned: boolean }> =
    data?.data ?? BADGES.map((b) => ({ ...b, earned: false }));

  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
      {badgeData.map((b) => (
        <div
          key={b.id}
          title={`${b.name}: ${b.description}`}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-help",
            b.earned
              ? "border-amber-500/40 bg-amber-500/5"
              : "border-border opacity-30 grayscale"
          )}
        >
          <span className="text-2xl">{b.icon}</span>
          <span className="text-[9px] text-center text-muted-foreground leading-tight line-clamp-2">
            {b.name}
          </span>
        </div>
      ))}
    </div>
  );
}

