// ─────────────────────────────────────────────────────────────
//  src/components/layout/sidebar.tsx
//  Collapsible dashboard sidebar with role-aware nav links.
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Bot,
  Users2,
  Award,
  Trophy,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BarChart3,
  CheckSquare,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { APP_NAME } from "@/config/constants";

const NAV_STUDENT = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/certifications", label: "Certifications", icon: GraduationCap },
  { href: "/coding", label: "Coding Practice", icon: Code2 },
  { href: "/ai-tutor", label: "AI Tutor", icon: Bot },
  { href: "/community", label: "Community", icon: Users2 },
  { href: "/certificates", label: "My Certificates", icon: Award },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

const NAV_INSTRUCTOR = [
  { href: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/instructor/create", label: "Create Course", icon: PlusCircle },
  ...NAV_STUDENT,
];

const NAV_ADMIN = [
  { href: "/admin/dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/submissions", label: "Submissions", icon: CheckSquare },
  { href: "/admin/users", label: "Users", icon: Users2 },
  {
    href: "/admin/certifications",
    label: "Certifications",
    icon: GraduationCap,
  },
  { href: "/dashboard", label: "My Dashboard", icon: Settings },
];

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const role = session?.user?.role ?? "STUDENT";
  const navItems =
    role === "ADMIN"
      ? NAV_ADMIN
      : role === "INSTRUCTOR"
        ? NAV_INSTRUCTOR
        : NAV_STUDENT;

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-screen bg-card border-r border-border shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">MS</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-foreground text-sm whitespace-nowrap"
            >
              {APP_NAME}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-2 py-2.5 rounded-md text-sm font-medium transition-colors group",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && !collapsed && (
                <motion.div
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[72px] -right-3 z-10 w-6 h-6 rounded-full bg-border border border-border flex items-center justify-center hover:bg-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
}
