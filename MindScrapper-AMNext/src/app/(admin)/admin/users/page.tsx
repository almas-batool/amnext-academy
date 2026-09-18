// ─────────────────────────────────────────────────────────────
//  src/app/(admin)/admin/users/page.tsx
//  Admin user management — search, filter, change roles.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Shield, GraduationCap, User as UserIcon, CheckCircle2, XCircle } from "lucide-react";
import { Input }  from "@/components/ui/input";
import { Badge }  from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

const ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN"] as const;

const roleIcon = (role: string) =>
  role === "ADMIN" ? Shield : role === "INSTRUCTOR" ? GraduationCap : UserIcon;

export default function AdminUsersPage() {
  const { toast } = useToast();
  const qc        = useQueryClient();
  const [search, setSearch] = useState("");
  const [role,   setRole]   = useState("all");
  const [page,   setPage]   = useState(1);

  const params = new URLSearchParams();
  if (search)        params.set("search", search);
  if (role !== "all") params.set("role", role);
  params.set("page", String(page));

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, role, page],
    queryFn:  async () => {
      const r = await fetch(`/api/admin/users?${params}`);
      return r.json();
    },
  });

  const users = data?.data ?? [];
  const total = data?.total ?? 0;

  const roleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const r = await fetch("/api/admin/users", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId, role: newRole }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
    },
    onSuccess: () => {
      toast({ title: "Role updated" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">{total} total users</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Verified</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">XP</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Enrollments</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => {
                const Icon = roleIcon(u.role);
                const initials = (u.name ?? u.email)[0].toUpperCase();
                return (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{u.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="gap-1 capitalize">
                        <Icon className="w-3 h-3" /> {u.role.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {u.emailVerified
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        : <XCircle className="w-4 h-4 text-muted-foreground" />}
                    </td>
                    <td className="px-4 py-3 font-medium text-amber-400">
                      {(u.profile?.xp ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u._count?.enrollments ?? 0}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        defaultValue={u.role}
                        onValueChange={(newRole) => roleMutation.mutate({ userId: u.id, newRole })}
                      >
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
