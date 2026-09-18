import { z } from "zod";

export const chapterSchema = z.object({
  certId: z.string().min(1),

  title: z.string().min(3, "Title must be at least 3 characters"),

  order: z.coerce.number().min(1),

  description: z.string().optional(),

  duration: z.coerce.number().optional(),

  isPreview: z.boolean().default(false),
});

export type ChapterInput = z.infer<typeof chapterSchema>;

