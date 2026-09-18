// ─────────────────────────────────────────────────────────────
//  src/components/layout/notification-bell.tsx
//  Dropdown showing recent XP gains, replies, and badge unlocks.
// ─────────────────────────────────────────────────────────────
"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, Zap, MessageSquare, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function NotificationBell() {
  const { data: session } = useSession();

  const { data } = useQuery({
    queryKey: ["recent-xp"],
    queryFn:  async () => {
      const r = await fetch("/api/gamification/xp");
      return r.json();
    },
    enabled: !!session?.user?.id,
    refetchInterval: 60_000,
  });

  // For demo: derive "notifications" from recent XP transactions
  const notifications: Array<{ id: string; text: string; time?: string; icon: any }> = [];

  if (data?.data) {
    // Profile-level info — in production, build a dedicated notifications table
    notifications.push({
      id:   "xp",
      text: `You have ${data.data.xp?.toLocaleString() ?? 0} XP total`,
      icon: Zap,
    });
  }

  const hasUnread = notifications.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} className="gap-2 py-2.5">
              <n.icon className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm">{n.text}</p>
                {n.time && <p className="text-xs text-muted-foreground">{n.time}</p>}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

