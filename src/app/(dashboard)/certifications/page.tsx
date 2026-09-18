// ─────────────────────────────────────────────────────────────
//  src/app/(dashboard)/certifications/page.tsx
//  Browse all published certifications with filters.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, Filter, BookOpen, Users, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { CERT_CATEGORIES } from "@/config/constants";

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

function CertCard({ cert }: { cert: any }) {
  const diffColor =
    cert.difficulty === "BEGINNER"     ? "success" :
    cert.difficulty === "INTERMEDIATE" ? "warning" : "destructive";

  return (
    <Link href={`/certifications/${cert.id}`}>
      <Card className="h-full hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer group overflow-hidden">
        {cert.thumbnail ? (
          <img
            src={cert.thumbnail}
            alt={cert.title}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-44 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex gap-2 mb-3 flex-wrap">
            <Badge variant="secondary" className="text-xs">{cert.category}</Badge>
            <Badge variant={diffColor as any} className="text-xs">{cert.difficulty}</Badge>
          </div>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {cert.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{cert.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> {cert.totalChapters} chapters
            </span>
            {cert.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {cert.duration}h
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {cert._count?.enrollments ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xl">
              {Number(cert.price) === 0
                ? <span className="text-emerald-400">Free</span>
                : formatCurrency(Number(cert.price), cert.currency)}
            </span>
            <span className="text-xs text-primary font-medium group-hover:underline">View course →</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CertificationsPage() {
  const [search,     setSearch]     = useState("");
  const [category,  setCategory]   = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [page,       setPage]       = useState(1);

  const params = new URLSearchParams();
  if (search)                  params.set("search",     search);
  if (category !== "all")      params.set("category",   category);
  if (difficulty !== "all")    params.set("difficulty",  difficulty);
  params.set("page",     String(page));
  params.set("pageSize", "12");

  const { data, isLoading } = useQuery({
    queryKey: ["certifications", search, category, difficulty, page],
    queryFn:  async () => {
      const r = await fetch(`/api/certifications?${params}`);
      return r.json();
    },
  });

  const certs   = data?.items ?? [];
  const total   = data?.total ?? 0;
  const hasMore = data?.hasMore ?? false;

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Certifications</h1>
        <p className="text-muted-foreground mt-1">
          Browse {total} industry-recognised certifications
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search certifications…"
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CERT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={(v) => { setDifficulty(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {DIFFICULTIES.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No certifications found</p>
          <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {certs.map((cert: any) => (
              <CertCard key={cert.id} cert={cert} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

