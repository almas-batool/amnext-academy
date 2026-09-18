// ─────────────────────────────────────────────────────────────
//  src/lib/services/gamification.service.ts
//  XP awards, streak tracking, badge evaluation.
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  XP_REWARDS,
  LEVEL_THRESHOLDS,
  BADGES,
  type XPReason,
} from "@/config/constants";
import { getLevelFromXP } from "@/lib/utils";

// ── XP ─────────────────────────────────────────────────────────

/** Award XP to a user and update their level. Returns the new XP state. */
export async function awardXP(
  userId: string,
  reason: XPReason,
  metadata: Record<string, unknown> = {},
) {
  const points = XP_REWARDS[reason];

  const prismaMetadata = JSON.parse(
    JSON.stringify(metadata),
  ) as Prisma.InputJsonValue;

  await prisma.xPTransaction.create({
    data: {
      userId,
      points,
      reason,
      metadata: prismaMetadata,
    },
  });

  const profile = await prisma.profile.update({
    where: { userId },
    data: {
      xp: { increment: points },
      lastActive: new Date(),
    },
  });

  const levelInfo = getLevelFromXP(profile.xp);

  if (levelInfo.level !== profile.level) {
    await prisma.profile.update({
      where: { userId },
      data: { level: levelInfo.level },
    });
  }

  // Non-blocking badge check
  checkAndAwardBadges(userId, profile.xp).catch(console.error);

  return {
    points,
    totalXp: profile.xp,
    level: levelInfo,
  };
}

// ── Streak ─────────────────────────────────────────────────────

/** Call once per day on user activity. Returns the new streak count. */
export async function updateStreak(userId: string): Promise<number> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) return 0;

  const now = new Date();
  const last = new Date(profile.lastActive);
  const diffHrs = (now.getTime() - last.getTime()) / 3_600_000;

  let streak = profile.streak;

  if (diffHrs < 24) {
    // Same session – no change
  } else if (diffHrs < 48) {
    streak += 1;

    if (streak === 7) {
      await awardXP(userId, "streak_7_day");
    }

    if (streak === 30) {
      await awardXP(userId, "streak_30_day");
    }
  } else {
    streak = 1;
  }

  await prisma.profile.update({
    where: { userId },
    data: {
      streak,
      lastActive: now,
    },
  });

  return streak;
}

// ── Badges ─────────────────────────────────────────────────────

/** Evaluate and persist newly earned badges for a user. */
async function checkAndAwardBadges(userId: string, xp: number) {
  const [certCount, solvedProblems, acceptedAnswers, profile] =
    await Promise.all([
      prisma.certificate.count({
        where: { userId },
      }),

      prisma.submission.count({
        where: {
          userId,
          status: "ACCEPTED",
        },
      }),

      prisma.communityReply.count({
        where: {
          userId,
          accepted: true,
        },
      }),

      prisma.profile.findUnique({
        where: { userId },
      }),
    ]);

  if (!profile) return;

  const current: string[] = Array.isArray(profile.badges)
    ? (profile.badges as string[])
    : [];

  const stats = {
    xp,
    streak: profile.streak,
    certCount,
    solvedProblems,
    acceptedAnswers,
  };

  const conditions: Record<string, boolean> = {
    first_cert: stats.certCount >= 1,
    streak_7: stats.streak >= 7,
    streak_30: stats.streak >= 30,
    code_solver_10: stats.solvedProblems >= 10,
    community_helper: stats.acceptedAnswers >= 5,
    xp_1000: stats.xp >= 1000,
    xp_10000: stats.xp >= 10000,
  };

  const newBadges = BADGES.filter(
    (badge) => !current.includes(badge.id) && conditions[badge.id],
  ).map((badge) => badge.id);

  if (newBadges.length > 0) {
    await prisma.profile.update({
      where: { userId },
      data: {
        badges: [...current, ...newBadges],
      },
    });
  }
}

