// ─────────────────────────────────────────────────────────────
//  src/app/(dashboard)/dashboard/page.tsx
//  Main student dashboard — XP, enrollments, recent activity.
// ─────────────────────────────────────────────────────────────
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLevelFromXP } from "@/lib/utils";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap, BookOpen, Code2, Trophy, Flame, ArrowRight,
  GraduationCap, TrendingUp,
} from "lucide-react";
import { BADGES } from "@/config/constants";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const [profile, enrollments, recentSubmissions, recentActivity] =
    await Promise.all([
      prisma.profile.findUnique({ where: { userId: session.user.id } }),
      prisma.enrollment.findMany({
        where:   { userId: session.user.id },
        include: { cert: { select: { id: true, title: true, thumbnail: true, totalChapters: true } } },
        orderBy: { enrolledAt: "desc" },
        take:    4,
      }),
      prisma.submission.findMany({
        where:   { userId: session.user.id, status: "ACCEPTED" },
        include: { problem: { select: { title: true, difficulty: true } } },
        orderBy: { createdAt: "desc" },
        take:    3,
      }),
      prisma.xPTransaction.findMany({
        where:   { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take:    6,
      }),
    ]);

  const xp        = profile?.xp ?? 0;
  const levelInfo = getLevelFromXP(xp);
  const earnedBadgeIds: string[] = Array.isArray(profile?.badges)
    ? (profile.badges as string[])
    : [];

  const stats = [
    { label: "Total XP",        value: xp.toLocaleString(),         icon: Zap,          color: "text-amber-400"  },
    { label: "Current Level",   value: `Lv ${levelInfo.level}`,     icon: TrendingUp,   color: "text-violet-400" },
    { label: "Day Streak",      value: `${profile?.streak ?? 0}🔥`, icon: Flame,        color: "text-orange-400" },
    { label: "Certifications",  value: enrollments.length.toString(),icon: GraduationCap,color: "text-blue-400"   },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session.user.name?.split(" ")[0] ?? "Learner"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {levelInfo.title} · {xp.toLocaleString()} XP
        </p>
      </div>

      {/* XP Progress */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Level {levelInfo.level} — {levelInfo.title}</span>
            {levelInfo.nextLevel && (
              <span className="text-muted-foreground">
                {xp.toLocaleString()} / {levelInfo.nextLevel.xp.toLocaleString()} XP
              </span>
            )}
          </div>
          <Progress value={levelInfo.progress} className="h-2" />
          {levelInfo.nextLevel && (
            <p className="text-xs text-muted-foreground">
              {(levelInfo.nextLevel.xp - xp).toLocaleString()} XP to reach Level {levelInfo.nextLevel.level} — {levelInfo.nextLevel.title}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <s.icon className={`w-5 h-5 ${s.color} mt-1`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Certifications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Certifications</h2>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link href="/certifications/my">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Button>
          </div>
          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No certifications yet</p>
                <Button asChild variant="gradient" size="sm">
                  <Link href="/certifications">Browse Certifications</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {enrollments.map((e) => (
                <Link key={e.id} href={`/certifications/${e.certId}/learn`}>
                  <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                    <CardContent className="py-4 flex items-center gap-4">
                      {e.cert.thumbnail ? (
                        <img
                          src={e.cert.thumbnail}
                          alt={e.cert.title}
                          className="w-16 h-12 object-cover rounded-md shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{e.cert.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Progress value={e.progress * 100} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground shrink-0">
                            {Math.round(e.progress * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Badges + Recent Activity */}
        <div className="space-y-6">
          {/* Badges */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Badges</h2>
            <Card>
              <CardContent className="pt-5">
                <div className="grid grid-cols-4 gap-3">
                  {BADGES.map((b) => {
                    const earned = earnedBadgeIds.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        title={`${b.name}: ${b.description}`}
                        className={`flex flex-col items-center gap-1 cursor-help transition-opacity ${earned ? "opacity-100" : "opacity-25 grayscale"}`}
                      >
                        <span className="text-2xl">{b.icon}</span>
                        <span className="text-[10px] text-center text-muted-foreground leading-tight">{b.name}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent XP */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Recent XP</h2>
            <Card>
              <CardContent className="pt-5 space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                ) : (
                  recentActivity.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {tx.reason.replace(/_/g, " ")}
                      </span>
                      <span className="text-amber-400 font-semibold">+{tx.points} XP</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/coding",       icon: Code2,          label: "Practice Coding",  desc: "Solve challenges", color: "from-emerald-600 to-teal-600"   },
          { href: "/ai-tutor",     icon: Zap,            label: "Ask AI Tutor",     desc: "Get instant help", color: "from-violet-600 to-purple-600"  },
          { href: "/community",    icon: Trophy,         label: "Join Community",   desc: "Help others earn XP",color:"from-blue-600 to-indigo-600"  },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer">
              <CardContent className="pt-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0`}>
                  <a.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

