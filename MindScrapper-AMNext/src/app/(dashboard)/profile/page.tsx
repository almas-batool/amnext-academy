// ─────────────────────────────────────────────────────────────
//  src/app/(dashboard)/profile/page.tsx
//  User profile page — edit name, avatar, bio, view stats.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Camera, Loader2, Save, Zap, Flame,
  GraduationCap, Code2, Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getLevelFromXP, formatDate } from "@/lib/utils";
import { BADGES } from "@/config/constants";

const profileSchema = z.object({
  name: z.string().min(2, "At least 2 characters").max(60),
  bio:  z.string().max(300).optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { toast }  = useToast();
  const qc         = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["profile-full"],
    queryFn:  async () => {
      const r = await fetch("/api/profile");
      return r.json();
    },
  });

  const profile    = data?.data?.profile;
  const user       = data?.data?.user;
  const stats      = data?.data?.stats;
  const xp         = profile?.xp ?? 0;
  const levelInfo  = getLevelFromXP(xp);
  const earnedBadges: string[] = Array.isArray(profile?.badges) ? profile.badges : [];

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver:      zodResolver(profileSchema),
    values: { name: user?.name ?? "", bio: profile?.bio ?? "" },
  });

  async function onSubmit(form: ProfileForm) {
    setSaving(true);
    const res  = await fetch("/api/profile", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      toast({ title: "Error", description: json.error, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      await update({ name: form.name });
      qc.invalidateQueries({ queryKey: ["profile-full"] });
    }
    setSaving(false);
  }

  const initials = (user?.name ?? user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — avatar + stats */}
        <div className="space-y-4">
          {/* Avatar card */}
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={user?.image ?? undefined} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background cursor-pointer hover:bg-primary/80 transition-colors">
                  <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              </div>
              <div>
                <p className="font-bold text-lg">{user?.name ?? "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-2 capitalize">
                  {user?.role?.toLowerCase()}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Level {levelInfo.level} · {levelInfo.title}
                </p>
                <Progress value={levelInfo.progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  {xp.toLocaleString()} XP
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Member since {user?.createdAt ? formatDate(user.createdAt) : "—"}
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Zap,           label: "Total XP",         value: xp.toLocaleString(),            color: "text-amber-400"  },
                { icon: Flame,         label: "Day Streak",       value: profile?.streak ?? 0,            color: "text-orange-400" },
                { icon: GraduationCap, label: "Certifications",   value: stats?.certCount ?? 0,           color: "text-blue-400"   },
                { icon: Code2,         label: "Problems Solved",  value: stats?.solvedProblems ?? 0,      color: "text-emerald-400"},
                { icon: Trophy,        label: "Badges Earned",    value: earnedBadges.length,             color: "text-violet-400" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Icon className={`w-4 h-4 ${color}`} /> {label}
                  </span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right — edit form + badges */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    placeholder="Tell the community a bit about yourself…"
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-xs text-destructive">{errors.bio.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={user?.email ?? ""} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Save className="w-4 h-4" />}
                  Save changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges ({earnedBadges.length}/{BADGES.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {BADGES.map((b) => {
                  const has = earnedBadges.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      title={b.description}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        has
                          ? "border-amber-500/40 bg-amber-500/5"
                          : "border-border opacity-30 grayscale"
                      }`}
                    >
                      <div className="text-3xl mb-1.5">{b.icon}</div>
                      <p className="text-xs font-medium leading-tight">{b.name}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
