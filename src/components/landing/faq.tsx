// src/components/landing/faq.tsx
"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  { q: "Are the certificates recognised by employers?",                  a: "Yes. Each certificate has a unique verifiable ID that employers can check at AMNext Academy.dev/verify. The certificate includes your name, course, score, and date." },
  { q: "Can I retake the exam if I fail?",                               a: "Yes. Most exams allow up to 3 attempts. After each attempt you'll see your score breakdown so you can improve." },
  { q: "What makes the AI Tutor different from ChatGPT?",                a: "The AI Tutor is trained on your specific course notes using RAG (Retrieval-Augmented Generation). It always cites sections from your materials and only uses general knowledge as a supplement." },
  { q: "Which coding languages are supported?",                          a: "30+ languages via the Piston API: JavaScript, Python, Java, C++, Go, Rust, Kotlin, PHP, Ruby, C#, and more." },
  { q: "Do I get a refund if I fail the certification exam?",            a: "We offer a 30-day money-back guarantee if you're unsatisfied with the course content. Exam failures are not automatically refunded, but reach out and we'll help." },
  { q: "How long do I have access to a certification after purchasing?", a: "Lifetime access. Once enrolled, the notes, coding problems, and AI tutor are yours to revisit any time." },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24 px-4 bg-muted/20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-medium text-foreground">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

