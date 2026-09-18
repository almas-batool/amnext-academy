// src/components/landing/features.tsx
"use client";
import { motion } from "framer-motion";
import { BookOpen, Code2, Bot, Award, Users2, Trophy } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Structured PDF Notes",
    color: "from-blue-500 to-cyan-500",
    description:
      "Beautifully formatted course material with highlights, bookmarks, and smart search.",
  },
  {
    icon: Code2,
    title: "Live Coding Practice",
    color: "from-emerald-500 to-teal-500",
    description:
      "VS Code-quality Monaco editor with support for 30+ languages via Piston API.",
  },
  {
    icon: Bot,
    title: "AI Tutor (RAG-Powered)",
    color: "from-violet-500 to-purple-500",
    description:
      "Ask questions about your course content. The AI reads your notes and gives cited answers.",
  },
  {
    icon: Award,
    title: "Verifiable Certificates",
    color: "from-amber-500 to-orange-500",
    description:
      "Pass the proctored exam and earn a certificate with a unique ID anyone can verify online.",
  },
  {
    icon: Users2,
    title: "Community Forum",
    color: "from-pink-500 to-rose-500",
    description:
      "Ask doubts, share insights, and help others. Earn XP for accepted answers.",
  },
  {
    icon: Trophy,
    title: "Gamification & XP",
    color: "from-indigo-500 to-blue-500",
    description:
      "Daily streaks, badges, and leaderboards keep your learning momentum alive.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">
          Everything you need to level up
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          One platform. Every tool you need to learn, practice, and certify.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
            }}
            className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}
            >
              <f.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {f.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

