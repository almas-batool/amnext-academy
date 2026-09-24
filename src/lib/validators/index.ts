// ─────────────────────────────────────────────────────────────
//  src/lib/validators/index.ts
//  All Zod schemas used for API input validation.
// ─────────────────────────────────────────────────────────────

import { z } from "zod";

// ── Auth ───────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Needs an uppercase letter")
    .regex(/[a-z]/, "Needs a lowercase letter")
    .regex(/[0-9]/, "Needs a number"),
  role: z.enum(["STUDENT", "INSTRUCTOR"]).default("STUDENT"),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

// ── Certifications ─────────────────────────────────────────────
export const certificationSchema = z.object({
  title:           z.string().min(5).max(120),
  description:     z.string().min(20).max(500),
  longDescription: z.string().optional(),
  category:        z.string().min(1),
  difficulty:      z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  price:           z.number().min(0),
  currency:        z.literal("USD"),
  learningOutcomes: z.array(z.string()).min(1),
  prerequisites:   z.array(z.string()).default([]),
  tags:            z.array(z.string()).default([]),
  duration:        z.number().optional(),
});

export const chapterSchema = z.object({
  title:   z.string().min(3).max(120),
  order:   z.number().min(1),
  content: z.string().optional(),
  summary: z.string().optional(),
});

// ── Assessments ────────────────────────────────────────────────
export const questionSchema = z.object({
  type:        z.enum(["MCQ", "MSQ", "TRUE_FALSE", "FILL_BLANK", "CODING"]),
  body:        z.string().min(5),
  options:     z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
  answer:      z.string().min(1),
  explanation: z.string().optional(),
  points:      z.number().min(1).default(1),
  difficulty:  z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("INTERMEDIATE"),
});

export const assessmentSchema = z.object({
  title:       z.string().min(3).max(120),
  description: z.string().optional(),
  type:        z.enum(["QUIZ", "PRACTICE", "CERTIFICATION_EXAM"]),
  passMark:    z.number().min(0).max(100).default(70),
  timeLimit:   z.number().optional(),
  negMark:     z.number().min(0).default(0),
  randomize:   z.boolean().default(true),
  maxAttempts: z.number().optional(),
  questions:   z.array(questionSchema).optional(),
});

// ── Coding ─────────────────────────────────────────────────────
export const codeRunSchema = z.object({
  language: z.string().min(1),
  code:     z.string().min(1),
  stdin:    z.string().optional(),
});

export const codeSubmitSchema = z.object({
  problemId: z.string().min(1),
  language:  z.string().min(1),
  code:      z.string().min(1),
});

// ── Community ──────────────────────────────────────────────────
export const communityPostSchema = z.object({
  title:  z.string().min(5).max(200),
  body:   z.string().min(10),
  tags:   z.array(z.string()).default([]),
  certId: z.string().optional(),
});

export const replySchema = z.object({
  body: z.string().min(3),
});

// ── Profile ────────────────────────────────────────────────────
export const profileUpdateSchema = z.object({
  name:       z.string().min(2).max(50).optional(),
  bio:        z.string().max(300).optional(),
  socialLinks: z
    .object({
      github:   z.string().url().optional().or(z.literal("")),
      linkedin: z.string().url().optional().or(z.literal("")),
      twitter:  z.string().url().optional().or(z.literal("")),
    })
    .optional(),
});

// Export inferred types
export type RegisterInput      = z.infer<typeof registerSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type AssessmentInput    = z.infer<typeof assessmentSchema>;

