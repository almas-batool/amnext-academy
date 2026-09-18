// ─────────────────────────────────────────────────────────────
//  src/app/(admin)/admin/dashboard/page.tsx
//  Admin analytics dashboard with charts and KPIs.
// ─────────────────────────────────────────────────────────────
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { AdminDashboardClient } from "@/components/admin/dashboard-client";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");
  return <AdminDashboardClient />;
}

