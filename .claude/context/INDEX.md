# CareerPilot — Claude Context Index

Quick-load this file at the start of any session to orient yourself.

## Project
CareerPilot — UAE AI career platform. Owned by Ayoub (AxisMind).
Stack: Next.js 14 App Router · TypeScript · Prisma · Supabase · Tailwind · NextAuth · Claude API · Ziina payments

## Context Files (read when relevant)

| File | When to read |
|---|---|
| `cofounder-brief.md` | Start of every session — role + non-negotiables |
| `decisions.md` | Before proposing any architectural change |
| `dont-break.md` | Before touching payments, auth, DB, or templates |

## Instructions (deep reference)

| File | Topic |
|---|---|
| `instructions/01-vision.md` | Mission, market, business model |
| `instructions/02-architecture.md` | Full tech stack and folder structure |
| `instructions/03-database.md` | Prisma models, plan codes, migrations |
| `instructions/04-features.md` | What's built vs what's pending |
| `instructions/05-payments.md` | Dual-rail payment system deep-dive |
| `instructions/06-pricing-and-coupons.md` | Pricing plans + coupon system |
| `instructions/07-resume-templates.md` | 24 templates, registry pattern, PDF export |
| `instructions/08-admin-system.md` | Admin pages, routes, settings system |
| `instructions/09-roadmap.md` | Next priorities and long-term plans |

## Most Critical Gap Right Now

Post-payment subscription activation is NOT implemented.
When a payment is approved, the user's `Subscription` row is NOT created.
See `instructions/09-roadmap.md` → Immediate → item 1.

## Need to Run

`prisma/seed_pricing.sql` — run in Supabase SQL Editor to populate pricing plans.
Without this, the subscription page plan selector is empty.
