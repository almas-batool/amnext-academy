// src/components/landing/pricing.tsx
"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name:  "Free",
    price: "$0",
    desc:  "Get started with the basics",
    features: ["Browse all 40 courses", "Community access", "3 coding problems/day", "AI Tutor (5 messages/day)"],
    cta:   "Get Started",
    href:  "/register",
    highlight: false,
  },
  {
    name:  "Pro",
    price: "$49",
    period: "/ course",
    desc:  "Pay as you learn",
    features: ["Full course access", "Unlimited coding practice", "Unlimited AI Tutor", "Course assessments", "Certification exam", "Verifiable certificate", "Community priority"],
    cta:   "Buy a Course",
    href:  "/courses",
    highlight: true,
  },
  {
    name:  "Enterprise",
    price: "Custom",
    desc:  "For teams and organizations",
    features: ["Bulk course seats", "Custom learning paths", "Analytics dashboard", "Dedicated support", "Custom branding", "API access"],
    cta:   "Contact Us",
    href:  "mailto:enterprise@amnextacademy.dev",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground">Pay per certification. No subscriptions. No lock-in.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`rounded-2xl border p-8 flex flex-col ${plan.highlight ? "border-primary bg-primary/5 relative" : "border-border bg-card"}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                <div className="text-4xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span></div>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant={plan.highlight ? "gradient" : "outline"} className="w-full">
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

