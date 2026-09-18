# MindScrapper 🎓

AI-powered certification & coding practice platform — Next.js 14, TypeScript, Prisma, PostgreSQL.

## Quick Start

```bash
# 0. (Optional) Spin up local PostgreSQL — skip if using Neon
docker compose up -d
# then in .env.local: DATABASE_URL="postgresql://MindScrapper:MindScrapper@localhost:5432/MindScrapper"

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials (see below)

# 3. Set up the database
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Run dev server
npm run dev
```

Visit **http://localhost:3000**

### Seeded test accounts
| Role       | Email                     | Password    |
|------------|---------------------------|-------------|
| Admin      | admin@MindScrapper.dev      | Admin@123   |
| Instructor | instructor@MindScrapper.dev | Instr@123   |
| Student    | student@MindScrapper.dev    | Student@123 |

---

## Required Services

| Service     | Purpose                  | Get credentials at                          |
|-------------|--------------------------|----------------------------------------------|
| Neon        | PostgreSQL database       | https://neon.tech                            |
| Google OAuth| Social login              | https://console.cloud.google.com             |
| Anthropic   | AI Tutor (Claude)         | https://console.anthropic.com                |
| Resend      | Transactional email       | https://resend.com                           |
| Cloudflare R2| File storage (PDFs, certs)| https://dash.cloudflare.com → R2            |
| Razorpay    | Payments (INR)            | https://dashboard.razorpay.com               |
| Stripe      | Payments (USD, optional)  | https://dashboard.stripe.com                 |

---

## Project Structure

See `FILE_MAP.md` for the complete file-by-file breakdown.

```
src/
├── app/            # Next.js App Router pages + API routes
├── components/     # React components (ui, layout, feature-specific)
├── lib/            # Auth, Prisma client, services, utils, validators
├── config/         # Constants (XP rewards, badges, categories, etc.)
├── providers/      # React context providers
├── hooks/          # Custom hooks
├── styles/         # Global CSS
└── middleware.ts   # RBAC + security headers
```

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel link
vercel env add DATABASE_URL production
# ... repeat for all vars in .env.example
vercel --prod
```

After deploying, configure webhook URLs:
- Razorpay: `https://yourdomain.com/api/payments/webhook/razorpay`
- Stripe:   `https://yourdomain.com/api/payments/webhook/stripe`

---

## Scripts

| Command            | Description                       |
|--------------------|------------------------------------|
| `npm run dev`      | Start dev server                   |
| `npm run build`    | Production build                   |
| `npm run start`    | Start production server            |
| `npm run db:push`  | Sync Prisma schema to database     |
| `npm run db:seed`  | Seed sample data                   |
| `npm run db:studio`| Open Prisma Studio (DB GUI)        |
