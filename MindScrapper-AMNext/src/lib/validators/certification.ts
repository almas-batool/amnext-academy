import { z } from "zod";

export const certificationSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),

  category: z.string().min(2),

  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),

  durationHours: z.coerce.number().min(1),

  price: z.coerce.number().min(0),

  currency: z.enum(["INR", "USD"]),

  thumbnailUrl: z.string().url(),
});

export type CertificationInput = z.infer<typeof certificationSchema>;
