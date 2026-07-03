# Database — Prisma Schema Reference

Database: **PostgreSQL on Supabase**
ORM: **Prisma**
Schema file: `prisma/schema.prisma`

## Key Models

### User
Central identity. Has `role` (user | admin), `planType` (free | pay_per_download | pro | business), Google OAuth support, and AI usage tracking via `AiUsage`.

### Resume
Stores resume data as JSON (`content: Json`). Each resume has a `templateKey` linking to the code registry. `metadata: Json` stores `{ isHtmlTemplate, htmlContent, templateKey }` for HTML-based templates.

### CoverLetter
Stores cover letter content. Linked to user. Can be AI-generated.

### InterviewSession + InterviewQuestion
Session stores target role/company/difficulty. Questions store individual Q&A pairs with AI feedback scores.

### Pricing
Active plans available for purchase. Fields: `code`, `name`, `amountFils`, `currency`, `durationDays`, `isActive`, `features (Json)`, `sortOrder`.

**Plan codes in use:**
- `starter` — 1000 fils (10 AED)
- `pro` — 3900 fils (39 AED/mo)
- `pro_annual` — 29900 fils (299 AED/yr)
- `automation` — 2900 fils (29 AED/mo)
- `growth` — 5900 fils (59 AED/mo)

Run `prisma/seed_pricing.sql` in Supabase SQL Editor to populate these.

### Payment
One row per payment attempt. Fields: `method` (whatsapp | ziina), `status` (pending_whatsapp | pending_ziina | approved | rejected | failed), `amountFils`, `discountFils`, `couponId`, `ziinaIntentId`, `whatsappUrl`, `approvedById`.

Transitions:
- WhatsApp: pending_whatsapp → approved (admin) | rejected
- Ziina: pending_ziina → approved (webhook) | failed

### Coupon + CouponUsage
Coupon: `code` (unique), `discountType` (percent | fixed), `discountValue`, `maxUses`, `usedCount`, `expiresAt`, `isActive`, `applicableTo` (array of plan codes or ['all']).

CouponUsage: tracks which user used which coupon on which payment. Used for per-user uniqueness enforcement.

### Subscription
Links a user to a Pricing plan with `startDate` / `endDate`. `status`: active | cancelled | expired.

### Automation + AutomationRun + AutomationEmailAccount
Automation stores the user's job search config. AutomationRun logs each execution. EmailAccount stores connected email credentials for outreach.

### Setting
Key-value store for admin-controlled platform settings. Read via `lib/settings.ts`.

### AuditLog + ActivityLog + Notification
AuditLog: security-sensitive events (logins, role changes, payment events).
ActivityLog: user activity for analytics.
Notification: in-app notification queue.

### EmailCampaign + EmailCampaignRecipient
Admin-created marketing email blasts.

### Company
Target companies for automation outreach. Stores domain, contacts, industry.

### ResumeTemplate (legacy)
DB-stored template metadata — no longer the source of truth. `/api/resumes/templates` reads from the code registry instead. Kept for backward compat.

## Migrations

All migrations are in `prisma/migrations/`. Applied in order:

1. Baseline schema (users, resumes, cover letters, interview)
2. Folder, document, company, resume version models
3. AuditLog, ActivityLog, Notification, EmailCampaign
4. Automation, EmailAccount models
5. `20260703060438_add_coupon_system` — Coupon, CouponUsage, Payment fields (couponId, discountFils)

## Migration Workflow

```bash
# Make schema changes in prisma/schema.prisma, then:
npx prisma migrate dev --name describe_the_change   # local dev
npx prisma migrate deploy                            # production (Vercel build runs this automatically)
```

Use `DIRECT_URL` (port 5432) for migrations, `DATABASE_URL` (port 6543 pooled) for runtime queries.
