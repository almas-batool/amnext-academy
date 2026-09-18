// ─────────────────────────────────────────────────────────────
//  src/app/api/admin/analytics/route.ts
//  Admin-only platform analytics endpoint.
// ─────────────────────────────────────────────────────────────
import { NextResponse }   from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET() {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [
    totalUsers,
    totalEnrollments,
    totalRevenue,
    totalCerts,
    recentUsers,
    topCerts,
    passRateRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.enrollment.count(),
    prisma.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    prisma.certificate.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take:    5,
      select:  { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.certification.findMany({
      where:   { status: "PUBLISHED" },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { enrollments: { _count: "desc" } },
      take:    5,
    }),
    prisma.examAttempt.groupBy({ by: ["passed"], _count: true }),
  ]);

  const passCount       = passRateRaw.find((r) => r.passed)?._count  ?? 0;
  const failCount       = passRateRaw.find((r) => !r.passed)?._count ?? 0;
  const passRatePercent = passCount + failCount > 0
    ? Math.round((passCount / (passCount + failCount)) * 100)
    : 0;

  // Monthly revenue (last 6 months)
  const since = new Date();
  since.setMonth(since.getMonth() - 6);
  const monthlyRevenue = await prisma.payment.findMany({
    where:   { status: "COMPLETED", createdAt: { gte: since } },
    select:  { amount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    data: {
      totalUsers,
      totalEnrollments,
      totalRevenue:    Number(totalRevenue._sum.amount ?? 0),
      totalCerts,
      passRatePercent,
      recentUsers,
      topCerts,
      monthlyRevenue,
    },
  });
}
