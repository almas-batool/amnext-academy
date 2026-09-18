# MindScrapper — Complete File Map
> 115 source files across frontend, backend, services, and config.

---

## Root Config Files
```
package.json          — npm scripts, all dependencies
next.config.js        — Next.js config (images, webpack aliases)
tailwind.config.ts    — Tailwind theme tokens, animations, dark mode
tsconfig.json         — TypeScript paths (@/* → src/*)
postcss.config.js     — PostCSS (Tailwind + Autoprefixer)
.env.example          — All required environment variables with comments
prisma/schema.prisma  — Complete database schema (20 models)
prisma/seed.ts        — Dev seed: admin, instructor, student, sample data
```

---

## src/config/
```
constants.ts          — APP_NAME, CERT_CATEGORIES, SUPPORTED_LANGUAGES,
                         XP_REWARDS, LEVEL_THRESHOLDS, BADGES registry
```

---

## src/types/
```
index.ts              — Shared TypeScript types (ApiResponse, etc.)
                         next-auth.d.ts augmentation (user.id, user.role)
```

---

## src/lib/
```
auth.ts               — NextAuth config: Google OAuth + credentials,
                         JWT callbacks, RBAC role injection
prisma.ts             — PrismaClient singleton (dev hot-reload safe)
utils/index.ts        — cn(), formatCurrency(), formatDate(),
                         formatRelativeTime(), getLevelFromXP(), slugify()
validators/index.ts   — Zod schemas for all forms
```

### src/lib/services/  (pure server-side, no Next.js dependencies)
```
certificate.service.ts  — issueCertificate(): generate SVG cert,
                           upload to R2, send email, award XP
email.service.ts        — Resend: verification, reset, cert emails
gamification.service.ts — awardXP(), updateStreak(), checkBadges()
piston.service.ts       — executeCode(), runTestCases() via Piston API
storage.service.ts      — uploadToR2(), getPresignedUrl(),
                           getUploadPresignedUrl(), deleteFromR2()
```

---

## src/providers/
```
providers.tsx           — SessionProvider + QueryClientProvider +
                           ThemeProvider wrapped together
```

---

## src/hooks/
```
use-toast.ts            — useToast() hook (Radix toast state manager)
```

---

## src/styles/
```
globals.css             — Tailwind directives, CSS variables (light/dark),
                           scrollbar styles, .prose-MindScrapper, .glass
```

---

## src/components/ui/  (ShadCN-style primitives)
```
avatar.tsx              — Avatar, AvatarImage, AvatarFallback
badge.tsx               — Badge with variants: default/secondary/success/warning/destructive
button.tsx              — Button with variants: default/outline/ghost/gradient
card.tsx                — Card, CardHeader, CardTitle, CardContent, CardFooter
dialog.tsx              — Dialog, DialogContent, DialogHeader, DialogTitle, etc.
dropdown-menu.tsx       — DropdownMenu + all sub-components
input.tsx               — Input
label.tsx               — Label
progress.tsx            — Progress bar
scroll-area.tsx         — ScrollArea + ScrollBar
select.tsx              — Select, SelectTrigger, SelectContent, SelectItem
separator.tsx           — Separator (horizontal/vertical)
skeleton.tsx            — Skeleton loading placeholder
tabs.tsx                — Tabs, TabsList, TabsTrigger, TabsContent
textarea.tsx            — Textarea
toast.tsx               — Toast primitives (Radix)
toaster.tsx             — Toaster component (renders toast list)
```

---

## src/components/layout/
```
sidebar.tsx             — Collapsible sidebar, role-aware nav links,
                           framer-motion collapse animation
topnav.tsx              — Search bar, XP counter, theme toggle,
                           notifications bell, user dropdown menu
```

---

## src/components/landing/
```
nav.tsx                 — Fixed top nav with mobile menu
hero.tsx                — Animated hero: aurora bg, floating cards,
                           headline, CTA buttons, stats
features.tsx            — 6-feature grid with icons
certs-section.tsx       — Server component: live cert cards from DB
pricing.tsx             — 3-tier pricing: Free / Pro / Enterprise
faq.tsx                 — Accordion FAQ (framer-motion)
footer.tsx              — 4-column footer with nav links
```

---

## src/components/certification/
```
enroll-button.tsx       — Handles free enroll or Razorpay checkout;
                           loads Razorpay SDK script inline
```

---

## src/components/workspace/
```
workspace-client.tsx    — Three-panel orchestrator (client):
                           chapter sidebar + panel toggle + nav arrows
notes-panel.tsx         — Markdown → HTML renderer for chapter notes
pdf-panel.tsx           — <iframe> PDF viewer + open-in-new-tab button
code-panel.tsx          — Monaco Editor (lazy-loaded) + language selector
                           + Run / Submit buttons + output/problem tabs
ai-chat-panel.tsx       — SSE streaming AI chat, suggestion chips,
                           message history, citation display
```

---

## src/components/assessment/
*(exam UI is inline in the exam page — self-contained)*

---

## src/components/admin/
```
dashboard-client.tsx    — KPI cards + Recharts AreaChart revenue chart
                           + top certs table + recent users list
```

## src/components/instructor/
```
course-editor-client.tsx — Tabbed editor: Overview/Chapters/Assessments/Coding
question-builder.tsx     — Create assessments + add MCQ/MSQ/True-False/
                            Fill-blank questions with answer keys, inline
                            in the Assessments tab
```

---

## src/app/layout.tsx
Root layout — Inter font, metadata, Providers + Toaster

---

## src/app/(marketing)/
```
page.tsx                — Public landing page (server component)
                           Imports all landing/* section components
```

---

## src/app/(auth)/
```
layout.tsx              — Centred auth shell (no sidebar)
login/page.tsx          — Email + password login, Google OAuth
register/page.tsx       — Signup with role selector (Student/Instructor)
forgot-password/page.tsx— Email reset request form
reset-password/page.tsx — New password form (token from URL)
```

---

## src/app/(dashboard)/
```
layout.tsx              — Auth guard + Sidebar + TopNav shell

dashboard/page.tsx      — XP bar, stat cards, active enrollments,
                           badges, recent XP feed, quick actions

certifications/
  page.tsx              — Browse all certs (search + category + level filter)
  my/page.tsx           — In-progress + completed enrollments
  [certId]/
    page.tsx            — Cert detail: chapters, outcomes, prereqs, enroll card
    learn/page.tsx      — Three-panel workspace (server → WorkspaceClient)
    exam/page.tsx       — Timed exam engine with anti-cheat + result screen

coding/
  page.tsx              — Problem list table (solved indicator, badges, filter)
  [problemId]/page.tsx  — Full-page Monaco editor + problem description

ai-tutor/page.tsx       — Standalone AI chat (full page)

community/
  page.tsx              — Forum: post list, filter, new post dialog
  [postId]/page.tsx     — Post detail with reply thread + reply form

certificates/page.tsx   — Grid of earned certificates with download + verify
achievements/page.tsx   — Level progress, badge grid, milestone list
profile/page.tsx        — Edit name/bio, avatar, stats sidebar
```

---

## src/app/(admin)/
```
layout.tsx              — Admin-only guard
admin/dashboard/page.tsx  — Loads AdminDashboardClient
admin/submissions/page.tsx— Approve/reject instructor content queue
admin/users/page.tsx      — (stub: uses /api/admin/users)
admin/analytics/page.tsx  — (stub: uses /api/admin/analytics)
```

---

## src/app/(instructor)/
```
layout.tsx                     — INSTRUCTOR or ADMIN guard
instructor/dashboard/page.tsx  — My courses list + stats + submissions
instructor/create/page.tsx     — Create new certification form
                                  (title, category, difficulty, outcomes, prereqs)
```

---

## src/app/verify/[certId]/page.tsx
Public certificate verification — no auth required

---

## src/middleware.ts
RBAC route guards + security headers (X-Frame-Options, HSTS, etc.)

---

## src/app/api/  — All backend routes

### Auth
```
api/auth/[...nextauth]/route.ts   — NextAuth handler
api/auth/register/route.ts        — Email signup + send verify email
api/auth/verify-email/route.ts    — Token → mark emailVerified
api/auth/forgot-password/route.ts — Send password reset email
api/auth/reset-password/route.ts  — Apply new password
```

### Certifications
```
api/certifications/route.ts                    — GET list / POST create
api/certifications/[certId]/route.ts           — GET detail / PUT update / DELETE
api/certifications/[certId]/enroll/route.ts    — POST enroll (free or trigger payment)
api/certifications/[certId]/chapters/route.ts  — GET chapters / POST add chapter
api/certifications/[certId]/progress/route.ts  — GET / PATCH progress
api/certifications/[certId]/exam/route.ts      — GET certification exam assessment
```

### Assessments
```
api/assessments/[assessmentId]/route.ts        — GET questions (answers hidden)
api/assessments/[assessmentId]/submit/route.ts — POST grade + award XP + issue cert
```

### Coding
```
api/coding/problems/route.ts                   — GET problem list
api/coding/problems/[problemId]/route.ts       — GET single problem (safe)
api/coding/run/route.ts                        — POST single code execution
api/coding/submit/route.ts                     — POST evaluate all test cases
```

### AI
```
api/ai/chat/route.ts              — POST SSE streaming chat / GET chat list
```

### Payments
```
api/payments/create-order/route.ts              — POST Razorpay or Stripe order
api/payments/webhook/razorpay/route.ts          — POST Razorpay webhook → fulfill enrollment
api/payments/webhook/stripe/route.ts            — POST Stripe webhook → fulfill enrollment
```

### Certificates
```
api/certificates/route.ts          — GET user's certs / POST generate
api/certificates/[certId]/route.ts — GET public cert verification (no auth)
```

### Community
```
api/community/posts/route.ts                         — GET list / POST create
api/community/posts/[postId]/replies/route.ts        — GET post+replies / POST reply
api/community/posts/[postId]/vote/route.ts           — POST vote (idempotent)
api/community/replies/[replyId]/accept/route.ts      — POST mark as accepted answer
```

### Gamification
```
api/gamification/xp/route.ts           — POST award XP / GET profile XP
api/gamification/leaderboard/route.ts  — GET weekly/monthly/all-time
api/gamification/badges/route.ts       — GET all badges with earned status
api/gamification/streak/route.ts       — GET streak / POST update streak
```

### Admin
```
api/admin/analytics/route.ts                            — GET platform KPIs
api/admin/users/route.ts                                — GET list / PATCH role
api/admin/submissions/route.ts                          — GET submission queue
api/admin/submissions/[submissionId]/approve/route.ts   — POST approve → publish
api/admin/submissions/[submissionId]/reject/route.ts    — POST reject
```

### Assessment Authoring (Instructor)
```
api/certifications/[certId]/assessments/route.ts — GET list / POST create assessment
api/assessments/[assessmentId]/questions/route.ts — GET (with answers) / POST add question
api/questions/[questionId]/route.ts               — PUT update / DELETE question
```

### Misc
```
api/profile/route.ts    — GET profile+stats / PATCH name+bio
api/uploads/route.ts    — POST presigned R2 upload URL
api/health/route.ts     — GET health check (app + DB), for uptime monitors
```

---

## Quick Setup

```bash
# 1. Clone and install
git clone https://github.com/you/MindScrapper.git
cd MindScrapper
npm install

# 2. Set environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_*, ANTHROPIC_API_KEY,
# RESEND_API_KEY, R2_*, RAZORPAY_*, STRIPE_*

# 3. Set up database
npx prisma db push
npm run db:seed

# 4. Start dev server
npm run dev
# → http://localhost:3000

# Test accounts (from seed):
#   admin@MindScrapper.dev      / Admin@123
#   instructor@MindScrapper.dev / Instr@123
#   student@MindScrapper.dev    / Student@123
```

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel link
vercel env add DATABASE_URL production
# ... add all env vars
vercel --prod
```

Set webhook URLs in dashboards:
- Razorpay: https://yourdomain.com/api/payments/webhook/razorpay
- Stripe:   https://yourdomain.com/api/payments/webhook/stripe
