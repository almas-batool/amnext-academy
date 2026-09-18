// ─────────────────────────────────────────────────────────────
//  src/components/admin/dashboard-client.tsx
//  Admin analytics dashboard — KPIs + recharts revenue chart.
// ─────────────────────────────────────────────────────────────
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  TrendingUp,
  BookOpen,
  Award,
  CheckCircle2,
  IndianRupee,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export function AdminDashboardClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const r = await fetch("/api/admin/analytics");
      return r.json();
    },
  });

  const d = data?.data;

  // Build monthly revenue series
  const monthlyData = (() => {
    if (!d?.monthlyRevenue) return [];
    const map: Record<string, number> = {};
    for (const p of d.monthlyRevenue) {
      const key = new Date(p.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      map[key] = (map[key] ?? 0) + Number(p.amount);
    }
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
  })();

  const kpis = [
    {
      label: "Total Users",
      value: d?.totalUsers,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Enrollments",
      value: d?.totalEnrollments,
      icon: BookOpen,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Revenue (INR)",
      value: `$${(d?.totalRevenue ?? 0).toLocaleString()}`,
      icon: IndianRupee,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Certificates Issued",
      value: d?.totalCerts,
      icon: Award,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Exam Pass Rate",
      value: `${d?.passRatePercent ?? 0}%`,
      icon: CheckCircle2,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* <AdminDashboardClient /> */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform overview and analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-5">
              <div
                className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center mb-3`}
              >
                <k.icon className={`w-4.5 h-4.5 ${k.color}`} />
              </div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No revenue data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tickFormatter={(v) => `$${v.toLocaleString()}`}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  formatter={(v: number) => [
                    `$${v.toLocaleString()}`,
                    "Revenue",
                  ]}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top certifications */}
        <Card>
          <CardHeader>
            <CardTitle>Top Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(d?.topCerts ?? []).map((c: any, i: number) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-medium shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c._count.enrollments} enrollments
                  </p>
                </div>
                <Badge variant="secondary">{c.difficulty}</Badge>
              </div>
            ))}
            {(d?.topCerts ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">
                No published certifications yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(d?.recentUsers ?? []).map((u: any) => (
              <div
                key={u.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium">{u.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className="text-[10px] capitalize mb-1"
                  >
                    {u.role.toLowerCase()}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {(d?.recentUsers ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No users yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

