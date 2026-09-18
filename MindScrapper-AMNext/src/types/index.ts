// ─────────────────────────────────────────────────────────────
//  src/types/index.ts
//  Central type definitions for the entire application.
// ─────────────────────────────────────────────────────────────

import "next-auth";
import { Role, Difficulty, CertStatus, SubmissionStatus } from "@prisma/client";

// ── NextAuth augmentation ──────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
    };
  }
  interface User {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

// ── API Helpers ────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ── Domain types ───────────────────────────────────────────────
export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface CertificationSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  price: number;
  currency: string;
  status: CertStatus;
  thumbnail?: string | null;
  duration?: number | null;
  totalChapters: number;
  instructor: { name: string | null; image: string | null };
  _count: { enrollments: number };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  xp: number;
  user: { name: string | null; image: string | null };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface TestCaseResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  runtime?: number;
  hidden?: boolean;
}

export interface XPInfo {
  points: number;
  totalXp: number;
  level: {
    level: number;
    title: string;
    nextLevel: { level: number; xp: number } | null;
    progress: number;
  };
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}
