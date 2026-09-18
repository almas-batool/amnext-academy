// src/components/gamification/streak-calendar.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Flame }    from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StreakCalendar() {
  const { data } = useQuery({
    queryKey: ["streak"],
    queryFn:  async () => {
      const r = await fetch("/api/gamification/streak");
      return r.json();
    },
  });

  const streak    = data?.data?.streak ?? 0;
  const lastActive = data?.data?.lastActive;

  // Build last 35 days
  const days: { date: Date; active: boolean }[] = [];
  const today = new Date();
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Simple heuristic: mark last `streak` days as active
    days.push({ date: d, active: i < streak });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="w-4 h-4 text-orange-400" />
          {streak} Day Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} className="text-[10px] text-muted-foreground text-center font-medium pb-1">{d}</div>
          ))}
          {/* Offset for first day */}
          {Array.from({ length: days[0].date.getDay() }).map((_, i) => (
            <div key={`gap-${i}`} />
          ))}
          {days.map((d, i) => (
            <div
              key={i}
              title={d.date.toDateString()}
              className={`h-5 w-5 rounded-sm mx-auto transition-colors ${
                d.active ? "bg-orange-400" : "bg-muted/60"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
