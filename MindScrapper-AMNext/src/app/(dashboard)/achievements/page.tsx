// src/app/(dashboard)/achievements/page.tsx
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLevelFromXP } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BADGES, LEVEL_THRESHOLDS } from "@/config/constants";

export const metadata = { title: "Achievements" };

export default async function AchievementsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const profile  = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  const xp       = profile?.xp ?? 0;
  const levelInfo = getLevelFromXP(xp);
  const earned   = Array.isArray(profile?.badges) ? (profile.badges as string[]) : [];

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground mt-1">Track your learning milestones</p>
      </div>

      {/* Level progress */}
      <Card>
        <CardHeader>
          <CardTitle>Level Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold">Level {levelInfo.level}</p>
              <p className="text-muted-foreground">{levelInfo.title}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-400">{xp.toLocaleString()} XP</p>
              {levelInfo.nextLevel && (
                <p className="text-sm text-muted-foreground">Next: {levelInfo.nextLevel.xp.toLocaleString()} XP</p>
              )}
            </div>
          </div>
          {levelInfo.nextLevel && (
            <div className="space-y-1.5">
              <Progress value={levelInfo.progress} className="h-3" />
              <p className="text-xs text-muted-foreground text-right">{levelInfo.progress}% to Level {levelInfo.nextLevel.level}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges ({earned.length}/{BADGES.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BADGES.map((b) => {
              const hasIt = earned.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-xl border p-4 text-center transition-all ${
                    hasIt
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-border opacity-40 grayscale"
                  }`}
                >
                  <div className="text-4xl mb-2">{b.icon}</div>
                  <p className="font-semibold text-sm">{b.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{b.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* All level milestones */}
      <Card>
        <CardHeader><CardTitle>Level Milestones</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {LEVEL_THRESHOLDS.map((t) => {
              const reached = xp >= t.xp;
              return (
                <div key={t.level} className={`flex items-center gap-4 p-3 rounded-lg ${reached ? "bg-primary/5" : "opacity-40"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {t.level}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.xp.toLocaleString()} XP required</p>
                  </div>
                  {reached && <span className="text-xs text-emerald-400 font-medium">✓ Reached</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
