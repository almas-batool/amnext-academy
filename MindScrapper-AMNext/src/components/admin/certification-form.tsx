//src/components/admin/certification-form.tsx

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  longDescription: z.string().optional(),

  category: z.string().min(2),

  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),

  price: z.coerce.number().min(0),

  currency: z.enum(["INR", "USD"]),

  duration: z.coerce.number().optional(),

  thumbnail: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CertificationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),

    defaultValues: {
      difficulty: "BEGINNER",
      currency: "INR",
    },
  });

  async function onSubmit(data: FormValues) {
    const res = await fetch("/api/admin/certifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data.title,
        slug: data.slug,
        description: data.description,

        category: data.category,
        difficulty: data.difficulty,

        durationHours: data.duration ?? 0,

        price: data.price,

        currency: data.currency,

        thumbnailUrl: data.thumbnail ?? "",
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error(json);
      alert(JSON.stringify(json, null, 2));
      return;
    }

    alert("Certification created successfully!");
  }

  return (
    <Card className="max-w-5xl">
      <CardHeader>
        <CardTitle>Create Certification</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>Title</Label>
            <Input {...register("title")} />

            <p className="text-red-500 text-sm">{errors.title?.message}</p>
          </div>

          <div>
            <Label>Slug</Label>
            <Input {...register("slug")} />
          </div>

          <div>
            <Label>Category</Label>
            <Input {...register("category")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Difficulty</Label>

              <select
                {...register("difficulty")}
                className="w-full border rounded-md h-10 bg-background px-3"
              >
                <option value="BEGINNER">Beginner</option>

                <option value="INTERMEDIATE">Intermediate</option>

                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div>
              <Label>Duration (Hours)</Label>

              <Input type="number" {...register("duration")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price</Label>

              <Input type="number" {...register("price")} />
            </div>

            <div>
              <Label>Currency</Label>

              <select
                {...register("currency")}
                className="w-full border rounded-md h-10 bg-background px-3"
              >
                <option value="INR">INR</option>

                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Thumbnail URL</Label>

            <Input {...register("thumbnail")} />
          </div>

          <div>
            <Label>Description</Label>

            <Textarea rows={5} {...register("description")} />
          </div>

          <div>
            <Label>Long Description</Label>

            <Textarea rows={8} {...register("longDescription")} />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            Save Certification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
