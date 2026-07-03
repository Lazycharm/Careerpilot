# Feature Map — Built vs Pending

## ✅ Built & Shipped

### Authentication
- Email/password login + registration
- Google OAuth
- Role-based access (user / admin)
- Session management via NextAuth.js
- Route protection middleware

### Resume Builder
- Full resume editor (personal info, work experience, education, skills, certifications, languages)
- 24 UAE-specific resume templates (ATS, Classic, Modern, Creative, Premium, Specialty)
- HTML template support with `{{placeholder}}` substitution
- ATS score analysis
- PDF export via Puppeteer
- Template gallery at `/templates` (5-column grid, all 24 shown)
- Photo support badge on templates that support it

### Cover Letter Builder
- AI-powered cover letter generation
- Editor with formatting
- PDF export
- Admin-managed cover letter templates

### Interview Prep
- AI mock interview sessions
- Question bank by role/difficulty
- AI scoring and feedback per answer
- Session results and history

### Automation
- User-configurable job search automation
- Email account connection for outreach
- Run history and monitoring
- Admin automation monitor at `/admin/automations`
- Standalone `automation` pricing plan

### Payments — Dual Rail
- WhatsApp rail: manual payment request → admin approves
- Ziina rail: online card payment via redirect
- `/api/payments/intent` — unified endpoint for both rails
- `/api/payments/methods` — returns currently enabled methods
- Admin payment management (approve / reject)

### Coupon System (shipped 2026-07-03)
- Admin UI at `/admin/coupons` — create, list, toggle, archive
- Coupon types: percent off OR fixed AED amount
- Per-user uniqueness enforcement (one use per coupon per user)
- Plan-specific applicability (`applicableTo` array)
- Expiry date + max uses limits
- Coupon applied BEFORE payment creation; both rails see discounted amount
- `CouponUsage` + `usedCount` updated atomically after payment
- Frontend: live validation on subscription page with strikethrough pricing

### Subscription Page
- Plan selector (Starter / Pro / Pro Annual / Automation / Growth)
- Live coupon input with debounced validation
- Strikethrough original price + savings badge when coupon applied
- Pay button shows final amount

### Admin Dashboard
- Stats (users, resumes, interviews, revenue)
- Users at AI limit warning
- AI usage table with plan override + usage reset per user
- Quick action cards: Users, Settings, Analytics, Templates, Companies, Email Campaigns, Cover Letters, Automations, Coupons, Audit Logs

### Admin Settings
- Homepage CMS (hero, features, testimonials)
- AI feature toggles and limits per plan
- Payment method enable/disable
- WhatsApp admin number config
- Pricing toggles

### SEO
- `robots.ts` + `sitemap.ts`
- Structured data
- Resume template pages (`/resume-templates/[industry]`)
- Blog (`/blog`)
- Job pages (`/jobs/[city]`, `/cv-for/[role]`)
- SEO-optimized landing page sections

### Loading States
- All pages use Skeleton UIs instead of spinners
- `loading.tsx` files for dashboard, admin, resume routes
- `status === 'authenticated' && loading` pattern (no flash)

### Skeleton UIs Implemented
dashboard, admin/*, resume/*, cover-letter/*, interview/*, automation/*, subscription, profile

---

## 🔲 Pending / Not Yet Built

### Entitlements Enforcement
- `lib/entitlements.ts` exists but enforcement on API routes needs audit
- After payment approval, user's `planType` should auto-upgrade
- After subscription expiry, plan should auto-downgrade

### Post-Payment Plan Activation
- When admin approves WhatsApp payment → user's subscription record should be created/extended
- When Ziina webhook fires → same
- Currently the approval just marks payment as `approved` — the subscription activation step is missing

### User Onboarding Flow
- No guided first-run experience after registration
- No profile completion wizard

### Notifications
- `Notification` model exists but no UI inbox
- No push notifications

### Mobile App
- Web only — no native iOS/Android app yet

### Arabic Language Support
- UI is English-only
- Planned: bilingual resume templates, Arabic UI toggle

### Referral System
- Not built — high priority for growth

### Company Job Board Integration
- `Company` model exists for automation targets
- No job board / company discovery UI for users

### Resume Versioning
- `ResumeVersion` model exists in schema
- No UI to view or restore past versions

### Analytics Dashboard (User-side)
- Admin analytics exists
- No user-facing analytics (how many times resume viewed, ATS score history, etc.)

### Email Onboarding Sequence
- `EmailCampaign` admin tool built
- No automated triggered onboarding emails (day 1, day 3, day 7)
