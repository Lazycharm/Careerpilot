# Phase 3 — Payments (WhatsApp + Ziina dual rail)

Status: **Complete, ready for review.**
Date: 2026-06-23

## Scope delivered

### A. Schema additions (additive — no destructive changes)
- enums `PaymentMethod { whatsapp ziina manual_other }`, `PaymentStatus { created pending_whatsapp pending_ziina approved rejected refunded failed }`.
- model `Pricing` — admin-editable plan catalogue (code unique, amountFils, durationDays, features JSON, sortOrder).
- model `Payment` — one row per attempt. Holds method, status, Ziina intent id, WhatsApp URL + template body, proof URLs, admin note, rejected reason, approve/reject timestamps. Indexed on `(userId,status)`, `(status,createdAt)`, `(method,status)`.
- model `WhatsAppTemplate` — admin-editable bodies with `{{mergeTags}}`. Codes: `payment_request`, `payment_approved`, `payment_rejected`.
- `User.payments` back-relation added.

**Run the migration:**
```bash
npx prisma migrate dev --name add_payment_pricing_whatsapptemplate
```

### B. Ziina rebuild against the documented API
- `lib/payments/ziina.ts` replaces ad-hoc Ziina code. Implements:
  - `createZiinaIntent` — `POST /api/payment_intent` with `currency_code`, `success_url` / `cancel_url` (supports `{PAYMENT_INTENT_ID}` substitution), `test` flag, idempotent `operation_id` (UUID).
  - `getZiinaIntent` — status fetch.
  - `verifyZiinaSignature` — HMAC-SHA256 of raw body, constant-time compared to `X-Hmac-Signature`. Refuses when secret is missing.
  - `isZiinaWebhookIP` — checks `cf-connecting-ip` / `x-real-ip` / `x-forwarded-for[0]` against the documented allowlist `3.29.184.186 / 3.29.190.95 / 20.233.47.127 / 13.202.161.181`.
- `app/api/payments/webhook/route.ts` rewritten with: IP allowlist → HMAC verify (using raw body) → idempotent state transition → 401/403 with no body access on failure.

### C. WhatsApp deep-link rail
- `lib/payments/whatsapp.ts` — `renderTemplate` (mustache-style merge), `buildWhatsAppUrl` (E.164 → digits, URL-encoded message), `loadTemplateBody` (DB-backed), `filsToAED`.
- Default template body used if admin hasn't seeded — but the seed script also creates 3 standard templates so admin can edit immediately.

### D. Payment router (one place for state transitions)
- `lib/payments/router.ts` —
  - `getEnabledPaymentMethods()` — reads `payments.whatsapp.enabled` + `payments.ziina.enabled` admin settings, also gates Ziina on `ZIINA_API_KEY` presence.
  - `createPayment({ userId, userName, pricingCode, method, … })` — validates plan, creates Payment row, then either builds the wa.me URL (template merge) or calls Ziina to mint an intent. Returns `{ payment, redirectUrl }`.
  - `approvePayment` / `rejectPayment` / `markZiinaCompleted` / `markZiinaFailed` — single source of truth for status transitions; safe to call multiple times (idempotent).
- `lib/payments/settings.ts` — typed settings accessor with 30 s in-process cache.

### E. Public API
- `GET  /api/payments/methods` — `{ methods: PaymentMethod[] }` driven by admin toggles.
- `POST /api/payments/intent` — `{ pricingCode, method, metadata? }` → `{ paymentId, status, redirectUrl }`. Rate-limited under `payments` bucket.
- `GET  /api/payments/[id]` — own-payment status polling for the success page.
- `POST /api/payments/webhook` — Ziina webhook (rewritten, IP + HMAC verified, idempotent). Activates a legacy `Subscription` row for backward compatibility until the Pricing-driven subscription model lands in Phase 4.

### F. Admin queue API
- `GET  /api/admin/payments` — filterable by `status`, `method`, user-`q`, paginated. Returns `pendingCount` for the sidebar badge.
- `POST /api/admin/payments/[id]/approve` — body `{ note? }`. Idempotent. Writes `AuditLog`. Provisions/extends a legacy `Subscription` based on `Pricing.durationDays` (default 30 days for one-shot bundles).
- `POST /api/admin/payments/[id]/reject` — body `{ reason }`. Idempotent. Writes `AuditLog`.

### G. Seed extended
`npm run seed` now also creates:
- 6 Pricing rows (`free`, `premium_bundle`, `tailored_pack`, `weekly`, `two_week`, `monthly`). Free is 0; premium/tailored are 5 AED; weekly/two-week/monthly use placeholder prices admin will tune.
- 3 WhatsApp templates (`payment_request`, `payment_approved`, `payment_rejected`).
- 5 payment settings: `payments.whatsapp.enabled` (true), `…adminNumber` (from `WHATSAPP_ADMIN_NUMBER` env), `…requestTemplateCode` (`payment_request`), `payments.ziina.enabled` (false), `payments.ziina.testMode` (true).

### H. Tests
- `tests/lib/payments/ziina.test.ts` — IP allowlist (positive + negative + trimmed), HMAC verify (valid / tampered / wrong-length / missing / no secret).
- `tests/lib/payments/whatsapp.test.ts` — template merge edge cases, URL building, fils → AED.

## Verification checklist

```bash
npx prisma migrate dev --name add_payment_pricing_whatsapptemplate
npm run seed
npm run typecheck
npm run test
npm run build
```

End-to-end manual smoke (with `WHATSAPP_ADMIN_NUMBER` set in `.env.local`):

1. Sign in.
2. `curl -s -X POST localhost:3000/api/payments/intent -H 'content-type: application/json' -d '{"pricingCode":"premium_bundle","method":"whatsapp"}'` → should return `{ redirectUrl: "https://wa.me/…" }` with the payment id in the message.
3. As admin: `GET /api/admin/payments?status=pending_whatsapp` → see the row.
4. `POST /api/admin/payments/<id>/approve` → row status flips, `Subscription` row appears/extends.
5. Flip `payments.whatsapp.enabled` to `false` in Settings → `GET /api/payments/methods` returns `{methods:[]}`.

For Ziina (production-only smoke):
1. Set `ZIINA_API_KEY` and flip `payments.ziina.enabled=true`.
2. Repeat step 2 with `"method":"ziina"` → should return a Ziina `redirect_url`.
3. Register webhook in Ziina dashboard pointing at `/api/payments/webhook` and copy the secret to `ZIINA_WEBHOOK_SECRET`.
4. Complete a test payment (test-mode card) → webhook fires, Payment status → `approved`, Subscription created.

## What we deliberately did NOT do

- **Rebuild `Subscription` around Pricing.** Webhook + approve still write to the legacy `Subscription` model so existing entitlement checks keep working. Phase 4 introduces a clean Pricing→Subscription provisioning step.
- **Migrate the three legacy routes** (`/api/payments/create`, `/api/payments/verify`, `/api/admin/webhook/register`) that still import the old `lib/ziina.ts`. They keep working. Phase 4 sunsets them alongside the editor rewrite.
- **Admin UI.** The Phase 5 admin dashboard wires up the queue + settings + templates; until then admin endpoints are usable via curl or a small tool.
- **Notifications.** Approval/rejection should email/WhatsApp the user; that pairs naturally with Phase 5's notification system.
- **Refund flow.** Schema supports it (`refunded` status), routes don't yet — wait for real volume.

## Action items for you

1. Add `npx prisma migrate dev --name add_payment_pricing_whatsapptemplate` then `npm run seed`.
2. Confirm `WHATSAPP_ADMIN_NUMBER` is set in `.env.local` (E.164, e.g. `+9715XXXXXXXX`) before seeding so the admin setting takes the right initial value.
3. When you're ready to switch Ziina on:
   - Set `ZIINA_API_KEY` in `.env.local`.
   - Register the webhook in Ziina dashboard pointing at `https://<your-domain>/api/payments/webhook`.
   - Copy the webhook secret to `ZIINA_WEBHOOK_SECRET`.
   - Flip `payments.ziina.enabled` to `true` in the `Setting` table.
4. **Still pending from earlier turns:** rotate the OpenAI key, Supabase password, and NEXTAUTH_SECRET that leaked through `.env.example`.

## Path to Phase 4

Reply **"approve phase 4"** for:
- Pricing-driven subscription provisioning (replaces the legacy `Subscription` planType).
- Folder + Document tables (additive migration) — "My Documents" with folders.
- Company database CRUD + tailored CV/CL pipeline.
- Editor rewrite (true PDF iframe preview, autosave, version history, ATS multi-score badge wired to `/api/ai/ats-analyze`).
- Playwright E2E scaffold against the new editor flow.
