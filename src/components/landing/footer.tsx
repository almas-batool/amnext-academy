// src/components/landing/footer.tsx
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">AMNext Academy</span>
            </div>
            <p className="text-sm text-muted-foreground">AI-powered certification platform for the next generation of developers.</p>
          </div>
          {[
            { title: "Platform",  links: [{ href: "/courses", label: "Courses" }, { href: "/coding", label: "Coding Practice" }, { href: "/community", label: "Community" }] },
            { title: "Company",   links: [{ href: "/about", label: "About" }, { href: "/blog", label: "Blog" }, { href: "/careers", label: "Careers" }] },
            { title: "Legal",     links: [{ href: "/privacy", label: "Privacy Policy" }, { href: "/terms", label: "Terms of Service" }, { href: "/refunds", label: "Refund Policy" }] },
          ].map(col => (
            <div key={col.title}>
              <h3 className="font-semibold text-sm mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l.href}><Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} AMNext Academy. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Made with ❤️ for learners worldwide</p>
        </div>
      </div>
    </footer>
  );
}

