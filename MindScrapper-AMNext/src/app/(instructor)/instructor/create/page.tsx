// ─────────────────────────────────────────────────────────────
//  src/app/(instructor)/instructor/create/page.tsx
//  Create a new certification (instructor).
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CERT_CATEGORIES } from "@/config/constants";

const schema = z.object({
  title:           z.string().min(5).max(120),
  description:     z.string().min(20).max(500),
  longDescription: z.string().optional(),
  category:        z.string().min(1),
  difficulty:      z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  price:           z.coerce.number().min(0),
  currency:        z.string().default("INR"),
  duration:        z.coerce.number().optional(),
  learningOutcomes:z.array(z.object({ value: z.string() })).min(1),
  prerequisites:   z.array(z.object({ value: z.string() })).default([]),
  tags:            z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CreateCoursePage() {
  const router    = useRouter();
  const { toast } = useToast();

  const {
    register, handleSubmit, control, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: {
      currency:         "INR",
      difficulty:       "BEGINNER",
      learningOutcomes: [{ value: "" }],
      prerequisites:    [],
    },
  });

  const { fields: outcomeFields, append: addOutcome, remove: removeOutcome } =
    useFieldArray({ control, name: "learningOutcomes" });

  const { fields: prereqFields, append: addPrereq, remove: removePrereq } =
    useFieldArray({ control, name: "prerequisites" });

  async function onSubmit(form: FormValues) {
    const tags    = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const payload = {
      ...form,
      tags,
      learningOutcomes: form.learningOutcomes.map((o) => o.value).filter(Boolean),
      prerequisites:    form.prerequisites.map((p) => p.value).filter(Boolean),
    };

    const res  = await fetch("/api/certifications", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      toast({ title: "Error", description: json.error, variant: "destructive" });
    } else {
      toast({ title: "Course created!", description: "Submitted for admin review." });
      router.push("/instructor/dashboard");
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Certification</h1>
        <p className="text-muted-foreground mt-1">
          Fill in the details and submit for admin review before publishing.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="e.g. Advanced JavaScript Development" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Short Description</Label>
              <Textarea rows={2} placeholder="One-sentence summary (shown in cards)…" {...register("description")} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Full Description (optional)</Label>
              <Textarea rows={5} placeholder="Detailed course overview…" {...register("longDescription")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CERT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">Required</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select defaultValue="BEGINNER" onValueChange={(v) => setValue("difficulty", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["BEGINNER","INTERMEDIATE","ADVANCED"].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Price (₹)</Label>
                <Input type="number" min={0} placeholder="999" {...register("price")} />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select defaultValue="INR" onValueChange={(v) => setValue("currency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Duration (hours)</Label>
                <Input type="number" min={1} placeholder="20" {...register("duration")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input placeholder="javascript, web, es6" {...register("tags")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Learning Outcomes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {outcomeFields.map((f, i) => (
              <div key={f.id} className="flex gap-2">
                <Input placeholder={`Outcome ${i + 1}`} {...register(`learningOutcomes.${i}.value`)} />
                {outcomeFields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOutcome(i)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addOutcome({ value: "" })}>
              <Plus className="w-3.5 h-3.5" /> Add outcome
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Prerequisites (optional)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {prereqFields.map((f, i) => (
              <div key={f.id} className="flex gap-2">
                <Input placeholder={`Prerequisite ${i + 1}`} {...register(`prerequisites.${i}.value`)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removePrereq(i)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addPrereq({ value: "" })}>
              <Plus className="w-3.5 h-3.5" /> Add prerequisite
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting} variant="gradient" className="w-full gap-2" size="lg">
          {isSubmitting
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />}
          Submit for Review
        </Button>
      </form>
    </div>
  );
}
