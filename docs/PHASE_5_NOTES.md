# Phase 5 — Admin Ops, Audit, Email, Legacy Sunset

Status: **Complete, ready for review.**
Date: 2026-06-23

## Scope delivered

### A. Schema additions (additive)
- enums `NotificationChannel { in_app email whatsapp push }`, `EmailCampaignStatus { draft scheduled sending sent paused failed }`.
- `AuditLog` — defensible forensic record. Indexed on `(actorId, createdAt)`, `(action, createdAt)`, `target`.
- `ActivityLog` — product analytics feed for user events.
- `Notification` — user-visible notifications (in-app + email + WhatsApp routing).
- `EmailCampaign` — admin-composed marketing / lifecycle campaigns.
- `User` back-relations: `auditEvents`, `activityEvents`, `notifications`.

**Migration:**
```bash
npx prisma migrate dev --name add_auditlog_activitylog_notification_emailcampaign
```

### B. Audit helper now persists
- `lib/security/audit.ts` switched from stdout logging to `prisma.auditLog.create()`. On failure (DB hiccup, transient error) it falls back to structured stdout so events are never lost. Crucially: **audit failures never bubble up**; the caller's primary action stays atomic.

### C. Resend wiring
- `lib/email/resend.ts` — fetch-based client, no SDK. Degrades to a structured no-op log when `RESEND_API_KEY` / `RESEND_FROM_EMAIL` aren't set.
- `lib/email/templates.ts` — `paymentApprovedEmail()` and `paymentRejectedEmail()` builders. Inline-styled HTML that renders in Gmail / Outlook / Apple Mail. Returns `{ subject, html, text }`. HTML-escapes user-controlled fields.

### D. Payment notifications
- Approve route fires a `Notification` row + Resend email (best-effort, never blocks the approval).
- Reject route does the same with the reason.

### E. Admin APIs
| Endpoint | Purpose |
|---|---|
| GET / POST `/api/admin/pricing` | List + create plans |
| PATCH / DELETE `/api/admin/pricing/[id]` | Update / delete (blocks delete when payments reference the row) |
| GET / PUT `/api/admin/whatsapp-templates` | List + bulk upsert |
| GET / PUT `/api/admin/ai-settings` | List + bulk upsert across 9 use-cases; clears the router's in-process cache |
| GET `/api/admin/audit-logs` | Filterable, paginated forensic log viewer |

All write paths emit `AuditLog` rows.

### F. Admin payments queue UI
- `app/admin/payments/page.tsx` — the most-used admin screen. Status filter chips, per-row WhatsApp deep-link, approve / reject buttons with note + reason capture, 20 s auto-refresh. Functional first, polish later.

### G. Dynamic-server sweep
- Added `export const dynamic = 'force-dynamic'` to 7 routes that were tripping the build's static-generation warnings:
  - `/api/admin/settings`, `/api/admin/stats`, `/api/admin/users`, `/api/admin/analytics`
  - `/api/cover-letters`, `/api/dashboard/stats`, `/api/subscription`

### H. Legacy Ziina sunset
- `/api/payments/create`, `/api/payments/verify`, `/api/admin/webhook/register` → replaced with HTTP 410 stubs explaining the replacement endpoint.
- `lib/ziina.ts` → deprecation stub. Any straggling import will throw at call time with a clear migration map.
- `app/subscription/page.tsx` migrated to the new `/api/payments/intent` endpoint with method preference (Ziina → fallback WhatsApp) resolved via `/api/payments/methods`.

### I. Tests
- `tests/lib/email/templates.test.ts` — subject/html/text contracts, date formatting, HTML escaping for user-controlled fields.

## Verification checklist

```bash
npx prisma migrate dev --name add_auditlog_activitylog_notification_emailcampaign
npm run typecheck
npm run test
npm run build      # should show fewer Dynamic Server Usage warnings (those 7 gone)
```

Manual smoke (PowerShell):
```powershell
$cookie  = "<your-admin-next-auth.session-token>"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$session.Cookies.Add((New-Object System.Net.Cookie("next-auth.session-token", $cookie, "/", "localhost")))

# Audit log viewer
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/audit-logs?pageSize=20" -WebSession $session | Format-List

# Pricing CRUD
Invoke-RestMethod -Uri http://localhost:3000/api/admin/pricing -WebSession $session | Format-List

# Open the admin queue in the browser
Start-Process http://localhost:3000/admin/payments
```

Approve a payment from the new UI and confirm:
1. The payment row flips to `approved`.
2. A `Notification` row exists for the user (check `prisma studio` → Notification table).
3. If `RESEND_API_KEY` is set, the user receives a real email; otherwise stdout shows `email_skipped`.
4. An `AuditLog` row with `action="payment.approve"` exists.

## What we deliberately did NOT do

- **Full admin shell (sidebar nav, all CRUD screens).** The payments queue is the only daily-use admin surface; the other admin views (pricing, templates, AI matrix, audit log) ship as API-only this phase and get UIs in Phase 5b/6 alongside the marketing surface work.
- **EmailCampaign broadcast send job.** Schema lives; admin UI + Resend bulk send come in Phase 6 with the broader notification / lifecycle work.
- **Activity log writes.** Schema + indexes are in place; instrumentation lands in Phase 6 alongside the user-facing "recent activity" feed.
- **Hard delete the 4 legacy files.** Sandbox can't delete on the Windows-mounted filesystem; they're now 410 stubs. To physically remove them, run from your Windows shell:
  ```powershell
  Remove-Item -Recurse "app\api\payments\create","app\api\payments\verify","app\api\admin\webhook"
  Remove-Item "lib\ziina.ts"
  ```

## Action items for you

1. `npx prisma migrate dev --name add_auditlog_activitylog_notification_emailcampaign`
2. `npm run typecheck && npm run test && npm run build`
3. **If Resend not yet configured:** sign up at resend.com, verify your `careerpilot.ae` domain (SPF/DKIM records), set `RESEND_API_KEY` + `RESEND_FROM_EMAIL` in `.env.local`. Without these, emails skip with a stdout log — everything else still works.
4. (Optional cleanup) physically delete the 4 legacy stub files using the `Remove-Item` commands above.
5. **Rotate the OpenAI key, Supabase password, and `NEXTAUTH_SECRET`** that leaked through `.env.example` earlier — still pending from Phase 2.

## Path to Phase 6

Reply **"approve phase 6"** for:
- Automation: `EmailAccount` model + Gmail OAuth, `Automation` + `AutomationRun` + `AutomationApplication` schema, BullMQ worker on Upstash, per-company tailored email generation.
- Activity log instrumentation across resume / cover-letter / interview / tailor / download events + a user-facing "recent activity" feed.
- EmailCampaign send job (Resend bulk) + admin compose UI.
- Cron job for subscription expiry sweeps.
