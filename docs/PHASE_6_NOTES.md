# Phase 6 — Automation, Activity, Campaigns, Cron

Status: **Complete, ready for review.**
Date: 2026-06-23

## Scope delivered

### A. Schema additions (additive)
- enums `AutomationStatus`, `AutomationRunStatus`, `EmailAccountProvider`.
- `EmailAccount` — user-connected mailbox. `oauthTokensEnc` stores the refresh token as AES-256-GCM ciphertext.
- `Automation` — scheduling config (`schedule` JSON), email account link, optional resume / cover letter, status, `nextRunAt` for cron pickup.
- `AutomationCompany` — join table.
- `AutomationRun` — per-tick telemetry.
- `AutomationApplication` — per-(automation, company) send record.

**Migration:**
```bash
npx prisma migrate dev --name add_automation_emailaccount_models
```

### B. Encryption helper (`lib/security/encryption.ts`)
- AES-256-GCM with random 12-byte IV + 16-byte auth tag, packed into a single base64 string for storage.
- Hard-fails when `ENCRYPTION_KEY` is missing — we refuse to silently store plaintext.
- Test fixture covers UTF-8 (incl. Arabic + emoji), random IV uniqueness, and tamper detection.

### C. Activity log
- `lib/activity.ts` — `recordActivity()` + `activityLabel()`, fire-and-forget. 14 typed event keys.
- Instrumented existing routes:
  - `POST /api/resumes` → `resume.created`
  - `GET /api/resumes/[id]/export` → `resume.exported`
  - `POST /api/ai/cover-letter` → `cover_letter.created`
  - `POST /api/ai/ats-analyze` → `ats.analyzed`
  - `POST /api/ai/tailor-cv` → `cv.tailored`
  - `POST /api/automations` → `automation.created`
  - `PATCH /api/automations/[id]` → `automation.paused` / `automation.resumed`
- `GET /api/activity` — caller's 50 newest events with human labels.

### D. Google OAuth + Gmail
- `lib/google/oauth.ts` — `buildGoogleAuthorizationUrl`, `exchangeGoogleCode`, `refreshGoogleAccessToken`, `fetchGoogleUserInfo`. No `googleapis` SDK — pure fetch.
- `lib/google/gmail.ts` — `gmailSend()` decrypts refresh token, refreshes access token, builds RFC-822 multipart/alternative, base64url-encodes, POSTs to Gmail send.
- Scope requested: **only** `gmail.send` + `userinfo.email` + `userinfo.profile` — narrowest blast radius.
- Routes:
  - `GET /api/email-accounts` — list.
  - `DELETE /api/email-accounts/[id]` — disconnect + auto-pause dependent automations.
  - `GET /api/email-accounts/oauth/google/start` — 302 to Google consent with CSRF state cookie.
  - `GET /api/email-accounts/oauth/google/callback` — verifies state, exchanges code, encrypts + persists refresh token, redirects to `/automation/email-accounts?connected=…`.

### E. Automation engine
- `lib/automation/scheduler.ts` — pure-function scheduler with UAE-friendly defaults (Asia/Dubai, 09:00–18:00 window, 30-minute cadence, 10/day cap). No cron-expression dependency.
- `/api/automations` CRUD with entitlement gate (`canRunAutomation` from `lib/entitlements`).
- `/api/cron/run-automations` — Vercel-cron-triggered. Picks up to 5 due automations per tick, respects working hours + daily cap, generates per-company application email via the AI router, sends through the user's Gmail, records `AutomationApplication` rows (`queued|sent|skipped|failed`).
- `/api/cron/expire-subscriptions` — hourly sweep that flips expired subscriptions + notifies users (in-app + email).
- `vercel.json` — registers both cron schedules.
- All cron endpoints authenticated via `Authorization: Bearer ${CRON_SECRET}` (`lib/security/cron-auth.ts`, constant-time compare).

### F. Email campaigns
- `lib/email/segments.ts` — narrow JSON DSL → Prisma where-clause (`allUsers`, `roles`, `createdSince/Before`, `hasActiveSubscription`, `pricingCodes`).
- `GET/POST /api/admin/email-campaigns` — list + create.
- `POST /api/admin/email-campaigns/[id]/send` — compile segment, fan out to Resend with concurrency 4, cap 500 recipients per call, status transitions `draft → sending → sent`, audit-logged.
- Bodies support `{{ name }}` and `{{ email }}` merge tags.

### G. New env vars
Added to `lib/env.ts` + `.env.example`:
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`
- `CRON_SECRET`
(`ENCRYPTION_KEY` was added back in Phase 0; now actually used.)

### H. Tests
- `tests/lib/security/encryption.test.ts` — round-trip UTF-8 (incl. Arabic + emoji), random IV uniqueness, tamper detection.
- `tests/lib/automation/scheduler.test.ts` — defaults, working-hours check, next-run computation including off-hours roll-forward.
- `tests/lib/google/oauth.test.ts` — authorization URL composition, login_hint, missing-client-id throw path.
- `tests/lib/email/segments.test.ts` — every DSL filter compiles to the expected Prisma where shape.

## Verification checklist

```bash
npx prisma migrate dev --name add_automation_emailaccount_models
npm run typecheck
npm run test
npm run build
```

Manual smoke (requires `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `ENCRYPTION_KEY`, `CRON_SECRET` in `.env.local`):

1. Configure Google OAuth at `https://console.cloud.google.com/apis/credentials`:
   - Authorized redirect URI: `http://localhost:3000/api/email-accounts/oauth/google/callback`
   - For production, add `https://<your-domain>/api/email-accounts/oauth/google/callback`.
2. Sign in to the app → hit `/api/email-accounts/oauth/google/start` in the browser → grant consent → you should land on `/automation/email-accounts?connected=<your-email>` (UI screen follows in Phase 6b, page returns 404 today; verify by checking `/api/email-accounts` shows the row).
3. Create an automation via `POST /api/automations`.
4. Trigger the cron locally:
   ```bash
   curl -X POST http://localhost:3000/api/cron/run-automations -H "Authorization: Bearer $CRON_SECRET"
   ```
5. Verify `AutomationApplication` rows in `prisma studio`.

## What we deliberately did NOT do

- **`/automation/email-accounts` UI screen.** Backend complete; the connect / list / disconnect UI lands in Phase 6b alongside the automation wizard. For now, hit `/api/email-accounts/oauth/google/start` directly to connect.
- **BullMQ / Upstash worker.** The Vercel-cron-driven endpoint pattern works on Vercel and is far simpler. If we move off Vercel later, swapping in BullMQ takes a single helper file change. Schedule + dispatch logic is already pure.
- **Bounce / failure handling beyond row status.** Gmail-bounced sends land as `failed` with the error message recorded — automatic retry / backoff comes in Phase 6b.
- **Deliverability heuristics.** Per-domain rate limits, link-tracking pixels, etc. — Phase 6b.
- **EmailCampaign admin UI.** API ready; admin uses curl + the audit log for now.
- **Cron drainer for queued campaigns.** Send endpoint is a single 60s window; admin invokes manually. Scheduled campaigns are not yet auto-drained (status sits at `scheduled` until admin triggers send).

## Action items

1. **Run the migration** (above).
2. **Generate an `ENCRYPTION_KEY`** if you haven't: `openssl rand -base64 32` → put in `.env.local`.
3. **Generate a `CRON_SECRET`**: `openssl rand -base64 32` → put in `.env.local`, and in Vercel environment variables (Production + Preview) before deploying.
4. **Set up Google Cloud OAuth credentials** if you want to use the Gmail automation flow.
5. **Still pending from earlier phases:** rotate the OpenAI key, Supabase password, and `NEXTAUTH_SECRET` that leaked through `.env.example`.

## Path to Phase 7

Reply **"approve phase 7"** for the final phase:
- Programmatic SEO surfaces — `/resume-templates/[industry]`, `/cv-for/[role]`, `/jobs/[city]`, `/companies/[slug]` rendered statically + sitemap.
- `BlogPost` + `IndustryPage` + `CityPage` schema and a minimal blog scaffold.
- `Notification` UI surface + dashboard "recent activity" widget.
- Automation wizard + email-accounts UI shell (Phase 6b shipped alongside Phase 7 for coherence).
- Final pre-launch QA: Lighthouse budget, axe-core sweep, Sentry sanity check, secret rotation audit.
