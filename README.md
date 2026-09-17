# AMNext Academy

A polished LMS demonstration website for **amnext.academy**.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Demo flow

Landing → Courses → Course Details → Login → Dashboard → Learning Player → Assessment → Certificate → Pricing → Checkout

## Stripe

Copy `.env.example` to `.env.local` and add Stripe TEST keys.

The current checkout screen is intentionally a demo placeholder. For a production payment flow, add a server route that creates a Stripe Checkout Session and redirects to its URL. Do not expose `STRIPE_SECRET_KEY` to the browser.

## Included

- Premium dark LMS UI
- Course catalog
- Course details and curriculum
- Learning paths
- Student dashboard
- Learning/video interface
- Assessment flow
- Certificate page
- Pricing
- Stripe-ready checkout entry
- Admin dashboard
- Responsive design
- Demo data

## Domain

Set your deployed Vercel domain to `amnext.academy` and add the domain in your registrar/DNS and Vercel project settings.
