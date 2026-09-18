// src/components/landing/nav.tsx
"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function LandingNav() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { href: "#features", label: "Features" },
    { href: "#certifications", label: "Certifications" },
    { href: "#pricing",  label: "Pricing" },
    { href: "/community", label: "Community" },
  ];
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0,  opacity: 1 }}
      className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">MindScrapper</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <Button asChild size="sm" variant="gradient">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" variant="gradient">
                  <Link href="/register">Get started</Link>
                </Button>
              </>
            )}
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>{l.label}</Link>
          ))}
        </div>
      )}
    </motion.nav>
  );
}
