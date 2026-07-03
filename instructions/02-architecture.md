# Architecture & Tech Stack

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui components |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | NextAuth.js (credentials + Google OAuth) |
| AI | Anthropic Claude API (claude-sonnet-4-6 primary) |
| Payments | Dual-rail: WhatsApp manual + Ziina online |
| Email | Nodemailer / custom email campaigns |
| PDF export | Puppeteer (server-side) |
| Error tracking | Sentry |
| Deployment | Vercel |

## Folder Structure

```
app/                    Next.js App Router pages + API routes
  (landing)/            Public marketing pages (homepage, templates, etc.)
  admin/                Admin-only pages (users, analytics, coupons, etc.)
  api/                  All API routes
    admin/              Admin-only APIs
    ai/                 AI generation endpoints
    payments/           Payment intent + webhooks
    coupons/            Coupon validation
    pricing/            Active plans list
    resumes/            Resume CRUD + PDF export
    cover-letter/       Cover letter CRUD + generation
    interview/          Interview session management
    automation/         Automation CRUD + run control
  auth/                 Login, register, reset password pages
  automation/           User-facing automation pages
  cover-letter/         Cover letter editor pages
  dashboard/            Main user dashboard
  interview/            Interview prep pages
  profile/              User profile
  resume/               Resume editor pages
  subscription/         Plan selector + checkout
  templates/            Public template gallery

components/
  ui/                   shadcn/ui primitives (Button, Card, Input, etc.)
  shared/               Navbar, Footer, shared layouts
  landing/              Homepage sections (TemplateShowcase, etc.)
  resume/               Resume editor components
  cover-letter/         Cover letter editor components

lib/
  ai/                   AI prompt builders and API wrappers
  auth.ts               NextAuth config
  automation/           Automation engine
  coupons/              Coupon validation logic (validate.ts)
  coverLetter/          Cover letter generation
  email/                Email sending utilities
  entitlements.ts       Feature gating by plan
  env.ts                Typed environment variables
  payments/             Payment router (router.ts), Ziina SDK, WhatsApp utils
  pdf/                  PDF rendering
  prisma.ts             Prisma client singleton
  resume/               Resume engine, templates registry, ATS scoring
  security/             Rate limiting, input sanitization
  settings.ts           Admin settings read/write
  subscription.ts       Subscription status helpers

prisma/
  schema.prisma         Single source of truth for all DB models
  migrations/           Applied Prisma migrations
  seed_pricing.sql      SQL to seed pricing plans (run manually in Supabase)

types/                  Shared TypeScript types
scripts/                One-off utility scripts
.claude/                Claude Code configuration (skills, rules, context)
instructions/           This folder — project documentation for Claude
```

## Key Architectural Decisions

### App Router + Server Components
Pages use React Server Components where possible. Client components (`'use client'`) only where interactivity is needed. `loading.tsx` files provide instant Suspense skeletons.

### Dual-rail Payments
`lib/payments/router.ts` is the single entry point for all payment creation. It routes to:
- **WhatsApp rail** — creates a Payment row and returns a `wa.me` deep-link for manual admin approval
- **Ziina rail** — creates a Payment row and returns a Ziina redirect URL for online card payment

Coupons are resolved BEFORE routing to either rail so both always see the discounted amount.

### Template Registry as Code
`lib/resume/templates/registry.ts` is the single source of truth for all resume templates. The DB is NOT used for template definitions — templates live in code. The `/api/resumes/templates` endpoint reads from the registry, not the DB.

### Entitlements Pattern
`lib/entitlements.ts` maps plan codes to feature gates (max downloads, AI calls, automation access). All feature checks go through this single file.

### Admin Settings
Platform settings (pricing toggle, WhatsApp number, AI limits, etc.) are stored as key-value rows in the `Setting` table and read via `lib/settings.ts`. Admin UI is at `/admin/settings`.

## Environment Variables (required)

```
DATABASE_URL                Supabase pooled connection string (port 6543)
DIRECT_URL                  Supabase direct connection string (port 5432, for migrations)
NEXTAUTH_SECRET             Random secret for NextAuth
NEXTAUTH_URL                Full site URL
NEXT_PUBLIC_SITE_URL        Full site URL (public)
ANTHROPIC_API_KEY           Claude API key
ZIINA_API_KEY               Ziina payment API key
ZIINA_WEBHOOK_SECRET        Ziina webhook signing secret
GOOGLE_CLIENT_ID            Google OAuth
GOOGLE_CLIENT_SECRET        Google OAuth
SENTRY_DSN                  Sentry error tracking
```
