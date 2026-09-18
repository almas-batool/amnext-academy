// ─────────────────────────────────────────────────────────────
//  src/app/(dashboard)/coding/page.tsx
//  Coding problem browser with difficulty filters.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Code2, CheckCircle2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DIFFS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export default function CodingPage() {
  const [search,     setSearch]     = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [page,       setPage]       = useState(1);

  const params = new URLSearchParams();
  if (search)               params.set("search",     search);
  if (difficulty !== "all") params.set("difficulty",  difficulty);
  params.set("page", String(page));

  const { data, isLoading } = useQuery({
    queryKey: ["problems", search, difficulty, page],
    queryFn:  async () => {
      const r = await fetch(`/api/coding/problems?${params}`);
      return r.json();
    },
  });

  const problems = data?.items ?? [];
  const total    = data?.total  ?? 0;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Coding Practice</h1>
        <p className="text-muted-foreground mt-1">{total} problems · 30+ languages</p>
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search problems…"
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={difficulty} onValueChange={(v) => { setDifficulty(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {DIFFS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-20">
          <Code2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No problems found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Problem</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Tags</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Difficulty</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Submissions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p: any) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    {p.solved
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/40" />}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/coding/${p.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex gap-1.5 flex-wrap">
                      {(p.tags ?? []).slice(0, 3).map((t: string) => (
                        <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        p.difficulty === "BEGINNER"     ? "success"     :
                        p.difficulty === "INTERMEDIATE" ? "warning"     : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {p._count?.submissions ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!data?.hasMore}>Next</Button>
      </div>
    </div>
  );
}

