// ─────────────────────────────────────────────────────────────
//  src/config/constants.ts
//  Centralised config values consumed across the app.
// ─────────────────────────────────────────────────────────────

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "AMNext Academy";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ── Certification categories ───────────────────────────────────
export const CERT_CATEGORIES = [
  "Web Development",
  "Programming",
  "Data Science",
  "AI / ML",
  "Cloud Computing",
  "DevOps",
  "Cyber Security",
  "Databases",
  "Software Engineering",
] as const;

export type CertCategory = (typeof CERT_CATEGORIES)[number];

// ── Programming languages (Piston-compatible) ──────────────────
export const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript", extension: "js" },
  { value: "typescript", label: "TypeScript", extension: "ts" },
  { value: "python",     label: "Python",     extension: "py" },
  { value: "java",       label: "Java",       extension: "java" },
  { value: "cpp",        label: "C++",        extension: "cpp" },
  { value: "c",          label: "C",          extension: "c" },
  { value: "go",         label: "Go",         extension: "go" },
  { value: "rust",       label: "Rust",       extension: "rs" },
  { value: "kotlin",     label: "Kotlin",     extension: "kt" },
  { value: "php",        label: "PHP",        extension: "php" },
  { value: "ruby",       label: "Ruby",       extension: "rb" },
  { value: "csharp",     label: "C#",         extension: "cs" },
] as const;

// ── Piston version map ─────────────────────────────────────────
export const PISTON_VERSIONS: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3"  },
  python:     { language: "python",     version: "3.10.0" },
  java:       { language: "java",       version: "15.0.2" },
  cpp:        { language: "c++",        version: "10.2.0" },
  c:          { language: "c",          version: "10.2.0" },
  go:         { language: "go",         version: "1.16.2" },
  rust:       { language: "rust",       version: "1.50.0" },
  kotlin:     { language: "kotlin",     version: "1.4.31" },
  php:        { language: "php",        version: "8.0.2"  },
  ruby:       { language: "ruby",       version: "3.0.1"  },
  csharp:     { language: "c#",         version: "6.12.0" },
};

// ── XP rewards table ───────────────────────────────────────────
export const XP_REWARDS = {
  chapter_read:              25,
  quiz_pass:                 50,
  quiz_fail:                 10,
  coding_beginner:           30,
  coding_intermediate:       60,
  coding_advanced:          100,
  certification_earned:     500,
  community_post_upvoted:    20,
  community_answer_accepted: 50,
  streak_7_day:             200,
  streak_30_day:           1000,
  daily_login:                5,
} as const;

export type XPReason = keyof typeof XP_REWARDS;

// ── Level thresholds ───────────────────────────────────────────
export const LEVEL_THRESHOLDS = [
  { level: 1,  xp: 0,      title: "Beginner"     },
  { level: 2,  xp: 500,    title: "Explorer"     },
  { level: 3,  xp: 1500,   title: "Learner"      },
  { level: 4,  xp: 3000,   title: "Practitioner" },
  { level: 5,  xp: 5000,   title: "Developer"    },
  { level: 6,  xp: 8000,   title: "Engineer"     },
  { level: 7,  xp: 12000,  title: "Architect"    },
  { level: 8,  xp: 18000,  title: "Specialist"   },
  { level: 9,  xp: 25000,  title: "Expert"       },
  { level: 10, xp: 35000,  title: "Master"       },
] as const;

// ── Badge registry ─────────────────────────────────────────────
export const BADGES = [
  { id: "first_cert",        name: "First Cert",        icon: "🎓", description: "Earned your first certification" },
  { id: "streak_7",          name: "7-Day Streak",      icon: "🔥", description: "7 consecutive days of learning" },
  { id: "streak_30",         name: "Month on Fire",     icon: "⚡", description: "30-day learning streak" },
  { id: "code_solver_10",    name: "Code Solver",       icon: "💻", description: "Solved 10 coding problems"      },
  { id: "community_helper",  name: "Community Helper",  icon: "⭐", description: "5 accepted answers"            },
  { id: "xp_1000",           name: "Rising Star",       icon: "🌟", description: "Reached 1,000 XP"             },
  { id: "xp_10000",          name: "Elite Learner",     icon: "🏆", description: "Reached 10,000 XP"            },
  { id: "perfect_score",     name: "Perfectionist",     icon: "💯", description: "100% on any exam"             },
] as const;

export type BadgeId = (typeof BADGES)[number]["id"];

