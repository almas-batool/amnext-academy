// ─────────────────────────────────────────────────────────────
//  src/lib/utils/index.ts
//  Shared utility functions used across the codebase.
// ─────────────────────────────────────────────────────────────

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LEVEL_THRESHOLDS } from "@/config/constants";

/** Tailwind class merger (shadcn/ui pattern). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as INR or USD currency. */
export function formatCurrency(
  amount: number,
  currency = "INR",
  locale = "en-IN",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a date relative to now (e.g. "3 days ago"). */
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Format a date to readable string. */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Compute level info from total XP. */
export function getLevelFromXP(xp: number) {
  type LevelThreshold = (typeof LEVEL_THRESHOLDS)[number];

  let current: LevelThreshold = LEVEL_THRESHOLDS[0];

  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.xp) {
      current = threshold;
    } else {
      break;
    }
  }

  const currentIndex = LEVEL_THRESHOLDS.findIndex(
    (threshold) => threshold.level === current.level,
  );

  const nextLevel =
    currentIndex >= 0 && currentIndex < LEVEL_THRESHOLDS.length - 1
      ? LEVEL_THRESHOLDS[currentIndex + 1]
      : null;

  const progress = nextLevel
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(((xp - current.xp) / (nextLevel.xp - current.xp)) * 100),
        ),
      )
    : 100;

  return {
    level: current.level,
    xp: current.xp,
    title: current.title,
    nextLevel,
    progress,
  };
}

/** Generate a URL-safe slug from a string. */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Truncate a string to a max length with ellipsis. */
export function truncate(str: string, max = 120): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

/** Capitalise first letter of each word. */
export function titleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}

/** Parse API error from a fetch response. */
export async function parseApiError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.error ?? json.message ?? `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
}

/** Safe JSON parse with a fallback. */
export function safeJsonParse<T>(str: unknown, fallback: T): T {
  if (typeof str !== "string") {
    return (str as T) ?? fallback;
  }

  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}
