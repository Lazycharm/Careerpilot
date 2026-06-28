# CareerPilot — Master Design Document

Status: **Proposal — awaiting approval**
Owner: Ayoub Sowed
Last updated: 2026-06-23

This document is the single source of truth for the CareerPilot rebuild. It contains the 12 deliverables required before any implementation code is written:

1. New Prisma schema (full)
2. API route map
3. UI/UX wireframes (per-screen spec)
4. User flows
5. Admin flows
6. Automation flow
7. Payment flow (Dual-rail: WhatsApp + Ziina, admin-toggleable)
8. SEO strategy
9. Testing strategy
10. Security strategy
11. Deployment strategy
12. Risk assessment

Decisions locked from prior turn:
- **Payments:** Keep Ziina **AND** WhatsApp. Both controllable from admin (either, or both, or neither — never breaks the app).
- **AI:** Claude (Anthropic) is primary. OpenAI is fallback. Admin can switch per use-case.
- **Templates:** Ship **12 production-grade ATS-safe templates** first. Expand later.

---

## 0. Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│                        EDGE / CDN                            │
│   Cloudflare WAF + Bot Protection + Cache (static assets)   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Vercel (Next.js 14)                       │
│   App Router · TS strict · React Server Components            │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│   │ Public site │  │ User cockpit │  │ Admin cockpit    │  │
│   └─────────────┘  └──────────────┘  └──────────────────┘  │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ API routes (Edge for read, Node for write/AI/PDF)    │  │
│   └──────────────────────────────────────────────────────┘  │
└─────────┬──────────────┬────────────┬───────────┬────────────┘
          │              │            │           │
   ┌──────▼─────┐  ┌─────▼─────┐ ┌────▼────┐ ┌────▼─────────┐
   │  Supabase  │  │  Upstash  │ │  Resend │ │  Storage     │
   │ Postgres + │  │  Redis +  │ │  Email  │ │  (Supabase)  │
   │   Auth     │  │  BullMQ   │ │         │ │  PDFs/Logos  │
   └────────────┘  └───────────┘ └─────────┘ └──────────────┘
          │              │            │
   ┌──────▼─────┐  ┌─────▼─────┐ ┌────▼─────┐  ┌─────────────┐
   │  Claude    │  │  OpenAI   │ │  Ziina   │  │  WhatsApp   │
   │  (primary) │  │ (fallback)│ │  (opt)   │  │  (deep-link)│
   └────────────┘  └───────────┘ └──────────┘  └─────────────┘
```

Worker tier (BullMQ on Upstash) handles: PDF generation, ATS analysis, AI generation, automation job-applications, email sending, subscription expiry sweeps, webhook fan-out.

---

## 1. Prisma schema (full)

Stored separately at `prisma/schema.proposed.prisma` so it can be reviewed as code. Highlights:

**New models added** beyond what exists today:
`Folder`, `Document` (unifies CV/CoverLetter/ATSReport/TailoredCV), `Company`, `CompanyContact`, `Payment`, `PaymentMethod` (enum), `Pricing`, `WhatsAppTemplate`, `EmailAccount`, `Automation`, `AutomationRun`, `AutomationApplication`, `EmailCampaign`, `Notification`, `AuditLog`, `ActivityLog`, `PDFExport`, `ATSReport`, `Template` (rebuilt with industry/role/lang/tier), `BlogPost`, `CityPage`, `IndustryPage`.

**Removed/refactored**: `Subscription.plan` enum is replaced by `Pricing.code` (admin-editable plan codes). Payments split out from Subscription.

**Encryption**: PII columns (`UserProfile.phone`, `Resume.data` sensitive fields) use Postgres `pgcrypto` symmetric encryption with key in env.

**Indices** declared on every FK and every common query column.

**Soft delete** on User, Resume, CoverLetter, Document with `deletedAt`.

See `prisma/schema.proposed.prisma`.

---

## 2. API route map

All routes are versioned under `/api/v1/*`. Auth: NextAuth session unless noted. Rate limit: 60 req/min/IP default, 10 req/min for AI + payment routes.

### Public
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/public/stats` | none | Real counters for landing page |
| GET | `/api/v1/public/templates` | none | Public template gallery |
| GET | `/api/v1/public/pricing` | none | Active pricing tiers |
| POST | `/api/v1/auth/register` | none | Create user + send verification |
| POST | `/api/v1/auth/forgot-password` | none | Send reset link via Resend |
| POST | `/api/v1/auth/reset-password` | token | Reset with token |

### User — Resumes
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/resumes` | user | List user's CVs |
| POST | `/api/v1/resumes` | user | Create CV from template |
| GET | `/api/v1/resumes/[id]` | owner | Fetch one |
| PATCH | `/api/v1/resumes/[id]` | owner | Autosave updates |
| DELETE | `/api/v1/resumes/[id]` | owner | Soft delete |
| POST | `/api/v1/resumes/[id]/duplicate` | owner | Clone |
| POST | `/api/v1/resumes/[id]/versions` | owner | Save named version |
| GET | `/api/v1/resumes/[id]/versions` | owner | List versions |
| POST | `/api/v1/resumes/[id]/ats` | owner | Run multi-score ATS analysis (queued) |
| GET | `/api/v1/resumes/[id]/ats/[reportId]` | owner | Fetch report |
| POST | `/api/v1/resumes/[id]/export` | owner+paid | Generate PDF (queued, returns job id) |
| GET | `/api/v1/exports/[jobId]` | owner | Poll PDF job |
| POST | `/api/v1/resumes/[id]/tailor` | owner+paid | Tailor for a Company |

### User — Cover Letters
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/cover-letters` | user | List |
| POST | `/api/v1/cover-letters` | user+paid | Generate (AI) |
| GET/PATCH/DELETE | `/api/v1/cover-letters/[id]` | owner | CRUD |
| POST | `/api/v1/cover-letters/[id]/export` | owner+paid | PDF |

### User — Interviews
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/interviews` | user | List sessions |
| POST | `/api/v1/interviews` | user | Start (industry + role) |
| GET | `/api/v1/interviews/[id]` | owner | Session detail |
| POST | `/api/v1/interviews/[id]/answer` | owner | Submit answer (queued analysis) |
| POST | `/api/v1/interviews/[id]/complete` | owner | Finalize → readiness |

### User — Documents & Folders
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/folders` | user | List |
| POST | `/api/v1/folders` | user | Create |
| PATCH | `/api/v1/folders/[id]` | owner | Rename/move |
| DELETE | `/api/v1/folders/[id]` | owner | Soft delete |
| GET | `/api/v1/documents` | user | List with filters (folder, type) |
| POST | `/api/v1/documents/move` | owner | Bulk move |

### User — Subscription & Payment
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/subscription` | user | Current subscription + entitlements |
| GET | `/api/v1/payments/methods` | user | Active payment methods (driven by admin toggle) |
| POST | `/api/v1/payments/intent` | user | Body `{pricingId, method:"whatsapp"\|"ziina"}` → returns either `whatsappUrl` or `ziinaRedirectUrl` |
| GET | `/api/v1/payments/[id]` | owner | Status |
| POST | `/api/v1/webhooks/ziina` | none (HMAC + IP allowlist) | Ziina webhook |

### User — Automation
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/email-accounts` | user | List connected mail accounts |
| POST | `/api/v1/email-accounts/oauth/start` | user | Begin Gmail OAuth |
| GET | `/api/v1/email-accounts/oauth/callback` | user | Finish OAuth |
| DELETE | `/api/v1/email-accounts/[id]` | owner | Disconnect |
| GET | `/api/v1/automations` | user | List |
| POST | `/api/v1/automations` | user+paid | Create (companies, schedule, template) |
| PATCH | `/api/v1/automations/[id]` | owner | Pause/resume/edit |
| GET | `/api/v1/automations/[id]/runs` | owner | Run log |
| GET | `/api/v1/automations/[id]/applications` | owner | Applied jobs |

### User — Companies
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/companies` | user | Browse (filter industry) |
| GET | `/api/v1/companies/[id]` | user | Detail |

### Admin
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/stats` | admin | KPIs |
| GET | `/api/v1/admin/users` | admin | List + filter |
| PATCH | `/api/v1/admin/users/[id]` | admin | Edit (role, subscription, reset usage) |
| GET/POST/PATCH/DELETE | `/api/v1/admin/pricing` | admin | Pricing CRUD |
| GET/POST/PATCH/DELETE | `/api/v1/admin/templates` | admin | Template CRUD + preview upload |
| GET/POST/PATCH/DELETE | `/api/v1/admin/companies` | admin | Company DB CRUD |
| GET | `/api/v1/admin/payments` | admin | Queue (filter: pending/approved/rejected) |
| POST | `/api/v1/admin/payments/[id]/approve` | admin | Approve + activate sub + send notif |
| POST | `/api/v1/admin/payments/[id]/reject` | admin | Reject + notify |
| GET/PUT | `/api/v1/admin/whatsapp-templates` | admin | WhatsApp message templates |
| GET/PUT | `/api/v1/admin/settings/payments` | admin | Toggle `whatsappEnabled`, `ziinaEnabled` |
| GET/PUT | `/api/v1/admin/settings/ai` | admin | Provider per use-case + model + temp + prompts |
| GET/PUT | `/api/v1/admin/settings/seo` | admin | Site-wide SEO |
| GET/PUT | `/api/v1/admin/settings/ats-rules` | admin | Score weights + keyword libraries |
| GET/POST | `/api/v1/admin/email-campaigns` | admin | Compose + send |
| GET | `/api/v1/admin/audit-logs` | admin | Audit feed |
| GET | `/api/v1/admin/activity-logs` | admin | Activity feed |

**Conventions**
- All write routes accept idempotency key in `Idempotency-Key` header.
- All responses use shape `{ ok: true, data } | { ok: false, error: { code, message, details? } }`.
- All routes validated by Zod schemas in `lib/api/contracts/*.ts`.

---

## 3. UI/UX wireframes (text-form)

### 3.1 Landing `/`
- **Hero**: Headline "Get hired in the UAE — faster". Subhead. Two CTAs ("Build my CV free", "See templates"). Trust strip (logos of UAE employers users have landed roles at — sourced from approved testimonials).
- **Live counters**: Resumes built, interviews aced, jobs landed (real numbers from `/api/v1/public/stats`, no fallback lies).
- **3-step "How it works"**: Build → Optimize → Apply.
- **Template gallery preview** (12 cards, hover preview, filter chips).
- **ATS proof**: animated multi-score gauge component (Remotion-rendered MP4 fallback for low-end devices).
- **Pricing strip** (driven by `/api/v1/public/pricing`).
- **Testimonials carousel**.
- **Industry landers grid** (programmatic SEO entry points).
- **FAQ** (existing structured data preserved).
- **Footer**: links, language toggle (EN/AR), social, legal.

### 3.2 Auth `/auth/*`
Single-column card, mobile-first, social proof line below form. Magic-link option in addition to password.

### 3.3 User cockpit `/dashboard`
- **Top**: welcome line + plan chip + entitlement meter (e.g. "3 of 5 downloads used").
- **4 KPI cards**: Resumes · Cover Letters · Interview Readiness · Automation runs.
- **Latest documents** (with thumbnail).
- **Action shelf**: New CV · New Cover Letter · Tailor for company · Start interview prep · Launch automation.
- **Onboarding checklist** (dismissible).

### 3.4 CV Builder `/resume/[id]`
- Two-pane on desktop, swipeable tabs on mobile.
- **Left pane** = form (sections: Personal, Summary, Experience, Education, Skills, Languages, Certifications, Projects, Awards, References) with drag-to-reorder.
- **Right pane** = live React-PDF preview (true PDF rendered in iframe).
- **Toolbar**: Template switcher, Color/font customizer, AI assist (Claude), ATS score badge (click = full report), Download (gated), Save version, Share read-only link.
- **Autosave** every 1.5s of inactivity, version pinned every 25 saves or on manual pin.

### 3.5 Cover Letter `/cover-letter/[id]`
- Form (Job title, Company, Industry, Tone, Length) + AI generate.
- Live PDF preview.
- "Pair with CV" picker.

### 3.6 ATS Report `/resume/[id]/ats`
- 5 radial gauges (ATS%, Recruiter, Readability, Industry Match, UAE Hiring).
- Section-by-section issues (severity badges).
- "Apply fix" buttons that mutate the CV.
- Keyword coverage heatmap vs job description (paste box).

### 3.7 Interview `/interview/[id]`
- Question card (one at a time), timer, text or audio answer.
- After each answer: instant AI feedback + score.
- End-of-session readiness page with strengths/weaknesses + suggested practice plan.

### 3.8 Documents `/documents`
- Sidebar = folder tree (Engineering, Marketing, etc.). Drag to move.
- Main = card grid: thumbnail, type chip, ATS badge, last-updated, downloads.
- Bulk actions: move, export, delete.

### 3.9 Automation `/automation`
- Wizard (Step 1: connect email → Step 2: pick companies → Step 3: pick CV+CL → Step 4: schedule → Step 5: review).
- Live runs feed, pause/resume, performance (open rate, reply rate where measurable).

### 3.10 Subscription `/subscription`
- Plan cards (driven by admin pricing).
- Each card has 2 buttons if both rails on: "Pay via Ziina" (instant) + "Pay via WhatsApp" (manual). One button if only one rail enabled. Disabled with friendly message if both off.

### 3.11 Admin cockpit `/admin`
- Sidebar nav: Overview · Users · Payments · Pricing · Templates · Companies · Automations · CRM · Marketing · Email · Notifications · SEO · AI Settings · ATS Rules · Audit · Activity · Settings · Security.
- Overview: live KPIs, revenue, MAU, churn, pending payment count badge (red dot).

### 3.12 Admin Payments queue
- Tabs: Pending · Approved · Rejected · All.
- Row: user, plan, method, amount, age, WhatsApp link, attachments (screenshots).
- Actions: Approve (sets subscription + sends Resend email + WhatsApp notify) · Reject (reason).

---

## 4. User flows (sequence)

**4.1 Build → Pay → Download (WhatsApp rail)**
1. Visitor signs up → free plan.
2. Picks template → opens editor.
3. Fills CV, autosaved.
4. Clicks Download → entitlement check fails (not paid).
5. Modal: shows enabled methods.
6. User picks **WhatsApp** → server creates `Payment(status=pending, method=whatsapp)` → returns `wa.me/<admin>?text=<encoded template>`.
7. Browser opens WhatsApp with prefilled message containing payment ID + amount + plan.
8. Admin sees row in Payments queue, replies with payment details, user pays, admin clicks Approve.
9. Subscription activated. User receives email + push notification. Download unlocked. PDF generated server-side, stored in Supabase Storage, signed URL returned.

**4.2 Build → Pay → Download (Ziina rail)**
1–5. Same as above.
6. User picks **Ziina** → server calls Ziina `/payment_intent` with amount in fils, success_url=`/payments/{PAYMENT_INTENT_ID}/success`, cancel_url=`/payments/{PAYMENT_INTENT_ID}/cancel`, webhook receives `payment_intent.status.updated`.
7. Webhook handler verifies `X-Hmac-Signature` (SHA-256 HMAC of body) and source IP is one of `3.29.184.186 / 3.29.190.95 / 20.233.47.127 / 13.202.161.181`.
8. On `completed`, mark `Payment.status=approved`, activate subscription, notify user.
9. Download unlocked.

**4.3 Tailored CV (5 AED package)**
1. User picks Company from database.
2. AI fetches role context + JD library for that company → generates tailored CV diff (preview before save).
3. Tailored CV + free tailored Cover Letter saved as new Document under same folder.
4. Standard payment flow gates the download.

**4.4 Interview prep**
1. User picks role + industry + experience level.
2. AI generates 10–15 questions across types (HR, technical, behavioral).
3. User answers; per-answer AI scoring + feedback.
4. Session complete → readiness % + strengths/weaknesses + 3 recommended practice questions.

**4.5 Automation**
1. User connects Gmail (OAuth) or generic SMTP.
2. Picks target companies (multi-select).
3. Picks base CV + base Cover Letter (or "generate per company").
4. Sets schedule (cadence, daily cap, working hours, timezone Asia/Dubai).
5. BullMQ worker fires jobs at scheduled times: generates tailored CV+CL+email per company, sends via connected account, logs to `AutomationApplication`.

---

## 5. Admin flows

**5.1 Approve a payment** (most-used path)
1. Badge alerts on sidebar.
2. Open Payments → Pending tab.
3. Click row → side drawer with user history, plan, screenshots.
4. Approve → backend: activate Subscription with computed `currentPeriodEnd`, create `Notification`, send Resend email, post WhatsApp follow-up template, write `AuditLog`.

**5.2 Toggle payment rails**
1. Settings → Payments.
2. Two switches: `WhatsApp Payments Enabled`, `Ziina Payments Enabled`.
3. Save → instant effect on `/api/v1/payments/methods`.
4. If both off → checkout shows "Payments temporarily unavailable, contact support" (graceful).

**5.3 Switch AI provider per use-case**
1. Settings → AI.
2. Matrix: rows = use-cases (CV summary, CV bullets, Cover letter, Interview Qs, Tailoring, ATS feedback). Columns = provider (Claude / OpenAI / Mock). Cell holds chosen provider, model, temperature, system prompt.
3. Save → providers resolved at request time from settings cache (Redis, 60s TTL).
4. Per-request override: if primary fails, automatically falls back to the other.

**5.4 Add a template**
1. Templates → New.
2. Fill name, category, industry, role, language, premium flag.
3. Upload preview image + JSON style descriptor.
4. Save → instantly visible in user gallery.

**5.5 Run an email campaign**
1. Marketing → New campaign.
2. Pick segment (filter by plan, signup date, last activity).
3. Compose (Markdown with merge tags).
4. Schedule or send now via Resend.

---

## 6. Automation flow diagram

```
User wizard ──► Automation row created (status=active, paused=false)
                              │
                              ▼
            BullMQ scheduler (cron: every minute)
                              │
                 enumerates due Automations
                              │
                  per Automation, per target Company:
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       Generate tailored  Generate tailored  Generate tailored
            CV (AI)         Cover letter      application email
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                  Render CV+CL PDFs (React-PDF worker)
                              │
                              ▼
              Send via connected EmailAccount (Gmail API
              or IMAP/SMTP with stored OAuth/refresh token)
                              │
                              ▼
              Write AutomationApplication{status, error?,
              messageId, sentAt} + AuditLog
                              │
                              ▼
              Throttle: respect dailyCap, workingHours,
              per-company cooldown, deliverability heuristics
```

Safeguards: domain rotation never spoofs; emails always from user's own account; explicit consent screen ("This will send emails on your behalf").

---

## 7. Payment flow — dual rail

### 7.1 State machine
```
        ┌────────────┐
        │  created   │
        └─────┬──────┘
              │  user picks method
       ┌──────┴───────┐
       ▼              ▼
   pending_whatsapp  pending_ziina
       │              │
       │              │ webhook completed
       │              ▼
       │           approved ──► subscription_active
       │
       │ admin approves
       ▼
    approved ──► subscription_active

   admin reject / ziina failed
       ▼
    rejected
```

### 7.2 Admin toggles
- `payments.whatsapp.enabled: boolean`
- `payments.whatsapp.adminNumber: string` (international format)
- `payments.whatsapp.templateId: string`
- `payments.ziina.enabled: boolean`
- `payments.ziina.testMode: boolean`
- `payments.ziina.apiKey: string` (encrypted at rest)
- `payments.ziina.webhookSecret: string` (encrypted)

### 7.3 Frontend resolution
`/api/v1/payments/methods` returns `{ methods: ["whatsapp", "ziina"] }` based on toggles. Checkout renders buttons in that order. If empty → "Payments temporarily unavailable" banner; existing approved subscriptions are unaffected.

### 7.4 Ziina implementation contract (per docs)
- Endpoint: `POST https://api-v2.ziina.com/api/payment_intent`
- Body: `{ amount: fils, currency_code: "AED", message, success_url: "https://careerpilot.ae/payments/{PAYMENT_INTENT_ID}/success", cancel_url, failure_url, test, operation_id (uuid for idempotency), metadata: { paymentId, userId, pricingId } }`
- Header: `Authorization: Bearer ${ZIINA_API_KEY}`
- Fetch status: `GET /payment_intent/{id}` → status ∈ `requires_payment_instrument | pending | requires_user_action | completed | failed`
- Webhook: `POST` to `https://careerpilot.ae/api/v1/webhooks/ziina`
- Event names: `payment_intent.status.updated`, `refund.status.updated`
- Verify: `X-Hmac-Signature` = hex SHA-256 HMAC of raw body using `webhookSecret`
- IP allowlist: `3.29.184.186, 3.29.190.95, 20.233.47.127, 13.202.161.181` — reject any other source IP
- Minimum amount: 200 fils (2 AED). Our smallest plan is 5 AED so we're safe.
- Test mode: pass `test: true` to skip charging.

### 7.5 WhatsApp implementation contract
- Deep link: `https://wa.me/<adminNumber>?text=<urlEncoded message>` where message is rendered from admin template using merge tags `{{paymentId}}, {{userName}}, {{planName}}, {{amountAED}}`.
- Server stores `Payment` row with `status="pending_whatsapp"` before redirecting.
- Admin queue surfaces all pending_whatsapp rows.

---

## 8. SEO strategy

### 8.1 Technical SEO baseline
- `next/metadata` per route, OG image route per dynamic page (`/opengraph-image.tsx`).
- `sitemap.ts` dynamic — generates entries for templates, blog posts, industry pages, city pages, company pages.
- `robots.ts` — disallow `/admin`, `/api`, `/dashboard`, `/resume`, `/cover-letter`, `/interview`, `/documents`, `/automation`, `/subscription`.
- JSON-LD: Organization, WebSite (with SearchAction), SoftwareApplication, FAQPage (per FAQ page), BreadcrumbList (per nested page), Article (blog), JobPosting structured data for city/role pages.
- Canonical tags on every page; `hreflang="en-AE"` + `hreflang="ar-AE"` once Arabic ships.
- Core Web Vitals budget: LCP < 2.5s, INP < 200ms, CLS < 0.1. Lighthouse CI in pipeline.

### 8.2 Programmatic SEO matrix
- `/resume-templates/[industry]` — 30 UAE-relevant industries (Banking, Hospitality, Construction, Healthcare, Tech, Logistics, Retail, Education, Energy, Legal, etc.).
- `/cv-for/[role]` — 100 role pages (Software Engineer, Accountant, Sales Manager, Nurse, Project Manager, etc.).
- `/jobs/[city]` — Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain.
- `/cv-templates/[language]` — English, Arabic.
- `/companies/[slug]` — Carrefour, Emirates, Etihad, Amazon, Noon, ADNOC, Emaar, Etisalat, Du, Dubai Holding, etc. (admin-managed).
- `/blog/[slug]` — 50 launch posts (long-tail keywords).
Total at launch: ~190 pages, all unique content (admin- or AI-seeded + human-edited).

### 8.3 AI / Answer-engine optimization
- Structured FAQ + HowTo schema across pillar pages.
- llms.txt at root listing site map and product description for LLM crawlers.
- Concise "TL;DR" boxes optimized for featured-snippet extraction.
- About / Methodology pages to build E-E-A-T.

### 8.4 Content engine
- Weekly blog cadence (target 2 posts).
- Each industry/role page = 800–1200 words minimum, original.
- Admin content scheduler in cockpit.

---

## 9. Testing strategy

| Layer | Tool | Target coverage |
|---|---|---|
| Unit | Vitest | 70% of `lib/*` |
| Component | Vitest + RTL | All shared components |
| Integration | Vitest + Prisma test DB | All API routes (happy + failure paths) |
| Contract | Zod schemas as source of truth, validated in tests | 100% of routes |
| E2E | Playwright | Auth, CV build, PDF export, payment (both rails), admin approval |
| Visual regression | Playwright + snapshot | All 12 templates rendered to PDF + screenshot diff |
| Accessibility | axe-core in Playwright | WCAG 2.1 AA on all public pages |
| Load | k6 | 500 RPS on read endpoints, 50 RPS on AI/PDF |
| Security | npm audit + Snyk + OWASP ZAP baseline | CI gate |
| Manual QA | Test plan per release | Pre-launch checklist |

CI: GitHub Actions — lint, typecheck, unit, integration on every PR; E2E + visual on main; deploy to Vercel preview per PR.

---

## 10. Security strategy

### 10.1 Threat model (STRIDE summary)
- **Spoofing**: brute-force login → rate limit + lockout + magic-link option. JWT short-lived, refresh-rotated.
- **Tampering**: webhook spoofing → HMAC verify + IP allowlist for Ziina; signed URLs for downloads (15 min TTL).
- **Repudiation**: every admin and user mutation writes `AuditLog{actor, action, target, before, after, ip, ua}`.
- **Information disclosure**: PII columns encrypted with `pgcrypto`. Storage objects private + signed URLs only. CSP locks down origins.
- **Denial of service**: Cloudflare WAF, Upstash rate-limit per route, per IP, per user. AI endpoint per-user daily cap.
- **Elevation of privilege**: Server re-checks role on every `/api/v1/admin/*` route (middleware not trusted alone). Admin actions require recent re-auth (5-min step-up).

### 10.2 Controls
- Headers: CSP (strict-dynamic + nonce), HSTS (preload), X-Content-Type-Options, X-Frame-Options=DENY, Referrer-Policy=strict-origin-when-cross-origin, Permissions-Policy minimal.
- CSRF: SameSite=Lax cookies + double-submit token on mutating routes.
- Passwords: argon2id (replace bcryptjs).
- Secrets: never in code; Vercel env per environment; rotation runbook.
- Backups: Supabase daily snapshots, PITR, monthly restore drill.
- Compliance: UAE PDPL + GDPR-ready (DSR endpoints: export-my-data, delete-my-account).
- Monitoring: Sentry errors, Vercel Analytics, custom audit feed, alert on >5 failed admin logins / 10 min.

---

## 11. Deployment strategy

| Layer | Provider | Notes |
|---|---|---|
| App | Vercel | Next.js 14 native; production + preview deploys per PR |
| DB | Supabase | Postgres 15 + RLS for defense-in-depth; daily snapshot + PITR |
| Cache/Queue | Upstash | Redis + BullMQ; serverless workers via Vercel functions or Railway worker |
| Email | Resend | Transactional + broadcast; SPF + DKIM + DMARC on `careerpilot.ae` |
| Storage | Supabase Storage | Private bucket; signed URL; CDN-fronted by Cloudflare |
| CDN/WAF | Cloudflare | DNS + WAF + bot protection + caching |
| Monitoring | Sentry + Vercel Analytics + BetterStack uptime | |
| Domain | careerpilot.ae (+ .com if available) | Auto-renew |

**Environments**: `local` → `preview` (per PR) → `staging` (main branch) → `production` (release branch with tag).

**Release process**:
1. PR → tests + Lighthouse + Snyk.
2. Merge to main → staging deploy + E2E run.
3. Tag `vX.Y.Z` → production deploy with `prisma migrate deploy` step.
4. Post-deploy smoke tests.
5. Auto-rollback on Sentry error spike >baseline 3σ.

---

## 12. Risk assessment

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | PDF rendering fails on edge templates (Arabic, long content) | M | H | React-PDF unit + visual-regression snapshots for all 12 templates × 3 sample CVs each; Playwright PDF fallback |
| 2 | Ziina webhook spoofed | L | H | HMAC verify + IP allowlist + idempotency by event id |
| 3 | Admin approves wrong payment | L | M | Confirmation modal showing amount + user + screenshot; AuditLog; reversible within 24h |
| 4 | AI provider outage during peak | M | M | Auto-fallback Claude ⇄ OpenAI per request; circuit breaker; mock provider for non-critical responses |
| 5 | Email automation flagged as spam | M | H | Send from user's own account only; explicit consent; per-domain throttling; pre-flight deliverability checks |
| 6 | Resume `data` JSON corruption | L | H | Zod validation on write; versioned snapshots; pgcrypto column encryption for PII subset |
| 7 | Compliance breach (UAE PDPL) | L | H | DPA, DSR endpoints, data-minimization, encryption, retention policy, deletion runbook |
| 8 | Template gallery looks "AI generic" | M | H | Hire human designer for 12 templates; review against UAE recruiter expectations |
| 9 | OAuth secrets leak via email integration | L | H | Refresh tokens encrypted at rest; revocation on disconnect; scoped to `gmail.send` minimum |
| 10 | Scope creep blocks launch | H | M | Phased plan with hard scope per phase; MVP cut documented; backlog discipline |

---

## Appendix A — Open questions before build

These do not block design approval but will block their respective phases:

- **A1.** Admin WhatsApp number for payment routing? Required before Phase 3.
- **A2.** Anthropic Claude API key + budget cap?
- **A3.** Resend domain `careerpilot.ae` — confirm ownership for SPF/DKIM setup.
- **A4.** Designer or stock for the 12 templates? Recommendation: hire one freelance designer to produce 12 Figma sources we then render in React-PDF (faster + on-brand than self-designing).
- **A5.** Arabic launch — Phase 1 (with English) or Phase 2 (post-launch)?

---

## Appendix B — File / module layout (target)

```
app/
  (public)/                  landing, blog, pricing, /resume-templates/*, /cv-for/*, /jobs/*, /companies/*
  (auth)/                    login, register, reset
  (user)/                    dashboard, resume/*, cover-letter/*, interview/*, documents/*, automation/*, subscription
  (admin)/                   admin/*
  api/v1/                    versioned routes (per route map above)
components/
  ui/                        shadcn full set
  resume/                    Editor, PreviewPDF, Toolbar, TemplateSwitch, Customizer, ATSPanel
  cover-letter/
  interview/
  documents/
  automation/
  admin/                     all admin tables, forms, drawers
  shared/                    Navbar, Sidebar, Toast, EmptyState, ErrorBoundary
lib/
  ai/
    providers/               claude.ts, openai.ts, mock.ts
    router.ts                resolves provider per use-case from settings
    prompts/                 cv.summary.ts, cv.bullets.ts, cl.generate.ts, interview.qs.ts, ats.feedback.ts
  pdf/
    react-pdf/               Template01..Template12.tsx, theme.ts, fonts.ts
    queue.ts                 BullMQ producer/consumer
  payments/
    ziina.ts                 client + verifier
    whatsapp.ts              deep-link builder
    router.ts                resolves enabled methods from settings
  automation/
    worker.ts
    email-providers/         gmail.ts, smtp.ts
  security/
    rate-limit.ts
    audit.ts
    encryption.ts
  settings/                  cached admin settings accessor
  contracts/                 Zod schemas per API route
  seo/                       metadata, sitemap helpers, JSON-LD builders
prisma/
  schema.prisma              live
  schema.proposed.prisma     this proposal
  migrations/                versioned migrations
tests/
  unit/  integration/  e2e/  visual/
```

---

## Approval gate

Reply **"build phase 0"** and I will execute Phase 0 only: Prisma migration setup, security headers, Sentry, rate limit, CI, then stop and check in.

Or reply with edits to this design first.
