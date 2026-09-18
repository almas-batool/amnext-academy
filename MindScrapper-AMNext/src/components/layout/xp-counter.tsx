// ─────────────────────────────────────────────────────────────
//  src/components/layout/xp-counter.tsx
//  Small XP pill shown in the top nav.
// ─────────────────────────────────────────────────────────────
"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Zap } from "lucide-react";
import Link from "next/link";

export function XPCounter() {
  const { data: session } = useSession();

  const { data } = useQuery({
    queryKey: ["xp-counter", session?.user?.id],
    queryFn:  async () => {
      const r = await fetch("/api/gamification/xp");
      return r.json();
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30_000,
  });

  const xp = data?.data?.xp ?? 0;

  return (
    <Link
      href="/achievements"
      className="hidden md:flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-3 py-1 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
    >
      <Zap className="w-3.5 h-3.5" />
      <span>{xp.toLocaleString()} XP</span>
    </Link>
  );
}
