# CareerPilot — Pre-launch Checklist

Date: 2026-06-23

Read top-to-bottom before flipping the production switch. Each item is a
hard gate unless explicitly marked **optional**.

---

## 1. Secrets & access (hard gate)

- [ ] **Rotate every secret that leaked through `.env.example` during dev:**
  - [ ] `OPENAI_API_KEY` (revoke + create new at platform.openai.com)
  - [ ] Supabase database password (Settings → Database → Reset password)
  - [ ] `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Generate fresh production secrets — never copy dev values:
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `CRON_SECRET`
  - [ ] `ENCRYPTION_KEY`
- [ ] Configure secrets in Vercel → Project → Settings → Environment Variables → **Production** and **Preview** (not Development).
- [ ] Confirm `.env.example` contains **only empty placeholders** (`grep -v '=""' .env.example` should return only headers and comments).
- [ ] Run `git log -p -- .env.example` and confirm no committed value is currently in use anywhere.
- [ ] Repository visibility: GitHub repo set to **private** until launch.

## 2. Database

- [ ] All migrations applied to production Supabase: `npx prisma migrate deploy` runs clean.
- [ ] Supabase Point-in-Time Recovery enabled (Project → Database → Backups → PITR).
- [ ] Daily snapshot retention ≥ 7 days.
- [ ] Indexes on every FK column (already enforced in schema).
- [ ] Run `prisma db seed` against production to populate templates + pricing + WhatsApp templates + sample companies.
- [ ] Verify `SELECT count(*) FROM "Pricing" WHERE "isActive";` ≥ 1.

## 3. Auth

- [ ] Production `NEXTAUTH_URL` set to `https://careerpilot.ae` (or your real domain).
- [ ] Admin user created with strong password (`ADMIN_PASSWORD` ≥ 12 chars; seed enforces this).
- [ ] Confirm `/auth/login` works end-to-end on production.
- [ ] Confirm middleware redirects unauthenticated `/dashboard` access to `/auth/login` (not `/api/auth/signin`).

## 4. Payments

- [ ] `WHATSAPP_ADMIN_NUMBER` set (E.164) in production env.
- [ ] `payments.whatsapp.adminNumber` setting matches the env value (re-seed if needed).
- [ ] Decision: Ziina on day 1? If yes:
  - [ ] `ZIINA_API_KEY` set in production env.
  - [ ] Webhook registered in Ziina dashboard pointing at `https://<domain>/api/payments/webhook`.
  - [ ] `ZIINA_WEBHOOK_SECRET` set in production env.
  - [ ] `payments.ziina.enabled` setting flipped to `true`.
  - [ ] `payments.ziina.testMode` set to `false` only after a successful test transaction.
- [ ] Manual smoke: complete a 5 AED WhatsApp payment, admin approves, user receives email + in-app notification, download unlocks.

## 5. Email deliverability

- [ ] Resend domain verification for `careerpilot.ae` (or your sending domain): SPF, DKIM, DMARC records added at the DNS host.
- [ ] `RESEND_API_KEY` + `RESEND_FROM_EMAIL` set in production env.
- [ ] Send a test transactional email to a fresh Gmail + Outlook + Apple Mail inbox — none should land in spam.

## 6. Cron / Automation

- [ ] `CRON_SECRET` set in production env (Vercel).
- [ ] `vercel.json` cron entries present (run-automations every minute, expire-subscriptions hourly).
- [ ] Verify by manual curl with the production secret:
      `curl -X POST https://<domain>/api/cron/run-automations -H "Authorization: Bearer $CRON_SECRET"` → 200.

## 7. Google OAuth (only if Gmail automation goes live on day 1)

- [ ] OAuth credentials created at console.cloud.google.com → APIs & Services → Credentials.
- [ ] Production redirect URI added: `https://<domain>/api/email-accounts/oauth/google/callback`.
- [ ] OAuth consent screen marked **Production**, scopes restricted to `gmail.send`, `userinfo.email`, `userinfo.profile`.
- [ ] `GOOGLE_OAUTH_CLIENT_ID` + `GOOGLE_OAUTH_CLIENT_SECRET` set in production env.
- [ ] End-to-end test: connect a Gmail account, create an automation against a real company, trigger cron, confirm a real email lands in the recipient's inbox.

## 8. Performance (Lighthouse budget)

Run `npx lighthouse https://<domain>/` and aim for:

- [ ] Performance ≥ 85 on desktop, ≥ 70 on mobile (Lighthouse mobile preset)
- [ ] LCP < 2.5 s
- [ ] CLS < 0.1
- [ ] INP < 200 ms
- [ ] First contentful paint < 1.8 s
- [ ] No JS error in the console on landing, dashboard, or any SEO page

If you miss a budget, common levers:
- Defer non-critical JS (`next/dynamic` with `ssr: false` on heavy editor components).
- Trim Framer Motion / Recharts from the landing bundle.
- Use `next/image` for any remaining raw `<img>` tags (build warnings list them).

## 9. Accessibility (axe-core sweep)

- [ ] Run `npx playwright test` (Phase 6 added the e2e scaffold).
- [ ] Spot-check with axe DevTools on:
  - [ ] Landing page
  - [ ] Auth (login + register)
  - [ ] Dashboard
  - [ ] Subscription page
  - [ ] At least one SEO landing page
- [ ] No "Serious" or "Critical" violations; "Moderate" tracked but not blocking.

## 10. SEO

- [ ] `https://<domain>/sitemap.xml` returns 200 with all the expected URLs (industries, roles, cities, companies, blog).
- [ ] `https://<domain>/robots.txt` correctly blocks `/api/`, `/admin/`, `/dashboard/`, etc., and points at the sitemap.
- [ ] Submit sitemap in Google Search Console + Bing Webmaster Tools.
- [ ] Open Graph preview for the homepage looks right on Twitter/X and LinkedIn share debuggers.

## 11. Observability

- [ ] `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` set in production env.
- [ ] Trigger a deliberate error (visit a route that throws) → confirm it shows up in Sentry within 60 s.
- [ ] BetterStack (or alternative) uptime monitor pings `/` every minute.
- [ ] Alert routed to your phone (SMS or push) for downtime ≥ 2 minutes.

## 12. Security

- [ ] Security headers present on every response: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`. Test with `curl -I https://<domain>/`.
- [ ] CSP report-only header is collecting data — review for two days, then promote to enforcing.
- [ ] Rate limit smoke: hit `/api/payments/intent` 20 times in a minute → 429 on the 11th call.
- [ ] Webhook IP allowlist active (Ziina) — try sending a webhook from your laptop → 403.
- [ ] Run `npm audit --omit=dev` → no Critical issues. High-only items documented with planned remediation.

## 13. Code health

- [ ] `npm run typecheck` clean.
- [ ] `npm run test` 100% pass.
- [ ] `npm run build` clean. The 7 dynamic-server-usage warnings from Phase 4 should be gone after the Phase 5 sweep.
- [ ] `npm run test:e2e` 4/4 pass.

## 14. Content

- [ ] Privacy policy reviewed by a UAE-aware lawyer (PDPL, data residency, AI-disclosed data).
- [ ] Terms of service likewise.
- [ ] Refund policy explicit for the WhatsApp payment workflow.

## 15. Domain & DNS

- [ ] `careerpilot.ae` registered, transferred, or pointed at Vercel.
- [ ] `www.careerpilot.ae` → 301 → `careerpilot.ae` (or vice versa, pick one canonical).
- [ ] SSL active (Vercel auto-provisions).
- [ ] DNS propagation confirmed from at least two different ISP networks.

## 16. Launch day rollback

- [ ] Vercel rollback button identified (Deployments → previous successful deploy → "Promote to production").
- [ ] Database snapshot taken **at the moment** of go-live.
- [ ] Incident response channel ready (Slack / WhatsApp).

---

**Sign-off**

| Name | Role | Date | Initials |
|---|---|---|---|
| | Tech lead | | |
| | Operations | | |
| | Legal review | | |
