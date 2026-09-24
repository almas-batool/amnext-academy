// src/components/landing/hero.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Code2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const floating = [
  { icon: "🎓", label: "Certified", x: "5%", y: "20%", delay: 0 },
  { icon: "💻", label: "Code Practice", x: "88%", y: "15%", delay: 0.3 },
  { icon: "🤖", label: "AI Tutor", x: "90%", y: "65%", delay: 0.6 },
  { icon: "⚡", label: "1250 XP", x: "3%", y: "70%", delay: 0.9 },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      {/* Floating cards */}
      {floating.map((f) => (
        <motion.div
          key={f.label}
          className="absolute hidden lg:flex items-center gap-2 glass rounded-xl px-3 py-2 text-sm font-medium"
          style={{ left: f.x, top: f.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{
            delay: f.delay,
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: f.delay,
            },
          }}
        >
          <span className="text-lg">{f.icon}</span>
          <span className="text-foreground">{f.label}</span>
        </motion.div>
      ))}

      <div className="text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm font-medium text-violet-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Certification Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="text-foreground">Certify.</span>{" "}
            <span className="text-foreground">Code.</span>{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Grow.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Master in-demand skills through structured notes, hands-on coding,
            and AI-powered tutoring. Earn verifiable certificates that employers
            trust.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="xl" variant="gradient" className="gap-2">
              <Link href="/register">
                Start Learning Free <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="gap-2">
              <Link href="/courses">
                <Award className="w-4 h-4" /> Browse Courses
              </Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: "50+", label: "Certifications" },
              { value: "10K+", label: "Students" },
              { value: "95%", label: "Pass Rate" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {s.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

