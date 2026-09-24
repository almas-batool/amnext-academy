"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, ClipboardList, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number | null;
  price: number;
  thumbnail: string | null;
  chapters: number;
  assessments: number;
};

type CourseCatalogProps = {
  courses: Course[];
};

export function CourseCatalog({ courses }: CourseCatalogProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const categories = Array.from(new Set(courses.map((course) => course.category))).sort();
  const filteredCourses = courses.filter((course) => {
    const matchesQuery = `${course.title} ${course.description} ${course.category}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesCategory = category === "all" || course.category === category;
    const matchesLevel = level === "all" || course.difficulty === level;
    return matchesQuery && matchesCategory && matchesLevel;
  });

  return (
    <>
      <div className="mb-8 grid gap-3 rounded-xl border border-border bg-card/60 p-4 md:grid-cols-[minmax(0,1fr)_190px_170px]">
        <label className="relative block">
          <span className="sr-only">Search courses</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses"
            className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-violet-500"
          />
        </label>
        <label>
          <span className="sr-only">Filter by category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-violet-500">
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by level</span>
          <select value={level} onChange={(event) => setLevel(event.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-violet-500">
            <option value="all">All levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </label>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-20 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No courses match those filters</h2>
          <p className="mt-2 text-muted-foreground">Try a broader search or reset one of the filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <article key={course.id} className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-950/20">
              {course.thumbnail ? <img src={course.thumbnail} alt={course.title} className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-48 items-center justify-center bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-background"><BookOpen className="h-12 w-12 text-violet-300" /></div>}
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-wrap gap-2"><Badge variant="secondary">{course.category}</Badge><Badge variant={course.difficulty === "BEGINNER" ? "success" : course.difficulty === "INTERMEDIATE" ? "warning" : "destructive"}>{course.difficulty}</Badge></div>
                <h2 className="text-xl font-semibold">{course.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{course.chapters} chapters</span>
                  <span className="flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" />{course.assessments} assessments</span>
                  {course.duration && <span>{course.duration} hours</span>}
                </div>
                <div className="mt-auto flex items-center justify-between gap-4 pt-6"><span className="text-xl font-bold">{formatCurrency(course.price, "USD", "en-US")}</span><Button asChild variant="outline" className="gap-2"><Link href={`/courses/${course.id}`}>View Course <ArrowRight className="h-4 w-4" /></Link></Button></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
