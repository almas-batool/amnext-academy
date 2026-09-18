// ─────────────────────────────────────────────────────────────
//  src/app/(admin)/admin/payments/page.tsx
//  Admin view of all payment transactions.
// ─────────────────────────────────────────────────────────────
import { prisma } from "@/lib/prisma";
import { Badge }  from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { IndianRupee, CheckCircle2, Clock, XCircle, RotateCcw } from "lucide-react";

export const metadata = { title: "Payments" };

const statusConfig: Record<string, { variant: any; icon: any }> = {
  COMPLETED: { variant: "success",     icon: CheckCircle2 },
  PENDING:   { variant: "warning",     icon: Clock        },
  FAILED:    { variant: "destructive", icon: XCircle      },
  REFUNDED:  { variant: "secondary",   icon: RotateCcw    },
};

export default async function AdminPaymentsPage() {
  const [payments, totals] = await Promise.all([
    prisma.payment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        // certId reference only — fetch title separately if needed
      },
      orderBy: { createdAt: "desc" },
      take:    50,
    }),
    prisma.payment.groupBy({
      by:    ["status"],
      _sum:  { amount: true },
      _count: true,
    }),
  ]);

  const certIds = [...new Set(payments.map((p) => p.certId))];
  const certs   = await prisma.certification.findMany({
    where:  { id: { in: certIds } },
    select: { id: true, title: true },
  });
  const certMap = new Map(certs.map((c) => [c.id, c.title]));

  const completed = totals.find((t) => t.status === "COMPLETED");
  const pending   = totals.find((t) => t.status === "PENDING");
  const refunded  = totals.find((t) => t.status === "REFUNDED");

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">Transaction history across the platform</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <IndianRupee className="w-4 h-4 text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-emerald-400">
              ₹{Number(completed?._sum.amount ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Revenue ({completed?._count ?? 0})</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Clock className="w-4 h-4 text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-amber-400">{pending?._count ?? 0}</p>
            <p className="text-xs text-muted-foreground">Pending Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <RotateCcw className="w-4 h-4 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{refunded?._count ?? 0}</p>
            <p className="text-xs text-muted-foreground">Refunds</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <CheckCircle2 className="w-4 h-4 text-blue-400 mb-2" />
            <p className="text-2xl font-bold">{payments.length}</p>
            <p className="text-xs text-muted-foreground">Recent Transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[750px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Course</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Gateway</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const cfg  = statusConfig[p.status] ?? statusConfig.PENDING;
              const Icon = cfg.icon;
              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.user.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{p.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {certMap.get(p.certId) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px]">{p.gateway}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(Number(p.amount), p.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={cfg.variant} className="gap-1 text-[10px]">
                      <Icon className="w-3 h-3" /> {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                </tr>
              );
            })}
            {payments.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No payments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
