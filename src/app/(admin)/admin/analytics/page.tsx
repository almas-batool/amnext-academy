// ─────────────────────────────────────────────────────────────
//  src/app/(admin)/admin/analytics/page.tsx
//  Detailed analytics — wraps the same client dashboard with
//  additional breakdowns (community, XP distribution).
// ─────────────────────────────────────────────────────────────
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "@/components/admin/dashboard-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XPDistributionChart } from "@/components/admin/xp-distribution-chart";

export const metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  // XP distribution buckets
  const profiles = await prisma.profile.findMany({ select: { xp: true } });
  const buckets = [
    { range: "0-500", min: 0, max: 500 },
    { range: "500-1.5K", min: 500, max: 1500 },
    { range: "1.5K-3K", min: 1500, max: 3000 },
    { range: "3K-5K", min: 3000, max: 5000 },
    { range: "5K-10K", min: 5000, max: 10000 },
    { range: "10K+", min: 10000, max: Infinity },
  ].map((b) => ({
    range: b.range,
    users: profiles.filter((p) => p.xp >= b.min && p.xp < b.max).length,
  }));

  // Community activity
  const [postCount, replyCount, activeUsers] = await Promise.all([
    prisma.communityPost.count(),
    prisma.communityReply.count(),
    prisma.profile.count({
      where: {
        lastActive: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-6xl">
      <AdminDashboardClient />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>XP Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <XPDistributionChart data={buckets} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Total Posts", value: postCount },
              { label: "Total Replies", value: replyCount },
              { label: "Active Users (7 days)", value: activeUsers },
            ].map((m) => (
              <div
                key={m.label}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <span className="text-xl font-bold">
                  {m.value.toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

