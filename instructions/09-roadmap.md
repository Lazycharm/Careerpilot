# Roadmap & Priorities

## Immediate (Next Sprint)

### 1. Post-Payment Subscription Activation
**Priority: CRITICAL — without this, payments don't unlock features**

When a payment is approved (WhatsApp manual or Ziina webhook), a `Subscription` row must be created/extended for the user.

- `approvePayment()` in `lib/payments/router.ts` → should also call a `activateSubscription(userId, pricingId)` helper
- `markZiinaCompleted()` → same
- `activateSubscription()` → upsert Subscription row with `startDate: now()`, `endDate: now() + durationDays`
- Also update `User.planType` to match the plan code

### 2. Seed Pricing Plans
Run `prisma/seed_pricing.sql` in Supabase SQL Editor to populate the 5 plans.
Without this, the subscription page plan selector is empty.

### 3. Launch Coupons
After seeding plans, create these coupons in `/admin/coupons`:
- `WELCOME50` — 50% off — all plans — unlimited uses — no expiry
- `EARLYBIRD` — 30% off — all plans — limited uses

---

## Short-Term (1–2 Months)

### User Onboarding Flow
- Post-registration wizard: "What's your goal?" → career path suggestion
- Profile completion progress bar
- First resume creation prompt

### Entitlements Enforcement Audit
- Review all AI generation routes — ensure they check plan limits
- Resume download: gate on plan's `downloads` limit
- Automation access: gate on `automation: true` in plan features

### Email Onboarding Sequence
- Day 0: Welcome + "complete your profile"
- Day 1: "Create your first resume"
- Day 3: "Try our interview prep"
- Day 7: Re-engagement if no activity

### Notifications Inbox
- `Notification` model exists, no UI yet
- Simple bell icon in Navbar with unread count
- List at `/notifications`

---

## Medium-Term (3–6 Months)

### Referral System
- User gets a unique referral link
- Referred user gets 20% off first plan
- Referrer gets 10 AED credit per successful referral
- Track via `Referral` model (to be added to schema)

### Arabic Language Support
- i18n setup (next-intl)
- Arabic resume templates (RTL layout)
- UI language toggle

### Resume Version History
- `ResumeVersion` model already in schema
- UI to view, compare, and restore previous versions

### Company / Job Discovery
- `Company` model exists — build user-facing company search
- Show which companies are automation-friendly
- Job alerts based on user's resume skills

### User Analytics Dashboard
- Resume view count (if hosted as shareable link)
- ATS score history chart
- Interview performance trends

---

## Long-Term (6–12 Months)

### Mobile App
- React Native or PWA with offline resume editing
- Push notifications for job matches

### Employer Side
- Companies can browse CareerPilot talent pool
- AI-matched candidate suggestions
- Reverse revenue stream

### LinkedIn Integration
- Import profile → generate resume
- One-click apply via LinkedIn API

### Skill Gap Analysis
- User uploads job description → AI identifies skill gaps → suggests learning resources

### CareerPilot Academy
- Curated courses + certificates
- UAE-specific certifications (PMP, Six Sigma, etc.)
- Tied to subscription tier

---

## Technical Debt to Address

| Item | Priority |
|---|---|
| Entitlements enforcement audit on all routes | High |
| Post-payment subscription activation | Critical |
| Remove legacy `ResumeTemplate` DB dependency | Low |
| Add rate limiting to AI routes | Medium |
| Write integration tests for payment flow | Medium |
| Sentry error coverage audit | Low |
