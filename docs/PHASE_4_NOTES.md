# Phase 4 — Documents, Companies, Tailoring, Entitlements

Status: **Complete, ready for review.**
Date: 2026-06-23

## Scope delivered

### A. Schema additions (additive)
- `enum DocumentType { resume cover_letter ats_report tailored_resume tailored_cover_letter }`.
- `model Folder` — single-level, soft-deletable, owned by a user, with sortOrder + color.
- `model Document` — unified pointer to either a `Resume` or `CoverLetter` (1-to-1, unique constraint enforces it). Holds title, tags, download counts, and a `metadata` JSON for tailored-document context.
- `model Company` — slug-unique UAE employer record (logo, industry, category, hqCity, description).
- `model CompanyContact` — verified contacts per company, used by Phase 6 automation.
- `model ResumeVersion` — labelled or auto-pinned snapshots of `Resume.data`.
- `Subscription.pricingId` — links the existing subscription row to the Phase 3 `Pricing` table without dropping the legacy `planType`. Indexed.
- Back-relations added on `User`, `Resume`, `CoverLetter`, `Pricing`.

**Run the migration:**
```bash
npx prisma migrate dev --name add_folder_document_company_resumeversion
```

### B. Pricing-driven entitlements (`lib/entitlements.ts`)
- `getEntitlements(userId)` returns `{ pricingCode, planName, currentPeriodEnd, resumeDownloadsRemaining, coverLetterDownloadsRemaining, canRunATSAnalysis, canGenerateCoverLetter, canTailorForCompany, canRunAutomation }`.
- Reads the user's active `Subscription`, prefers the linked `Pricing.features` JSON, falls back gracefully to the legacy `PlanType` enum so paid users mid-cutover keep their access.
- Parser is defensive: `'unlimited'` → `null`, numbers clamped, falsy strings treated as off.
- Exposed via `GET /api/entitlements` for the UI to render paywall / "downloads remaining" badges without re-implementing the resolver client-side.

### C. Folder API
- `GET  /api/folders` — list (with per-folder `documentCount`).
- `POST /api/folders` — create. Zod-validated.
- `PATCH /api/folders/[id]` — rename / recolor / re-sort.
- `DELETE /api/folders/[id]` — soft-delete. Documents inside surface as "Uncategorised".

### D. Document API
- `GET /api/documents` — filter by `folderId` (`uuid|null|all`), `type`, free-text `q`. Joins folder + resume + cover-letter previews.
- `POST /api/documents` — create a pointer for an existing resume or cover letter. Verifies ownership of all referenced rows.
- `POST /api/documents/move` — batch move into a target folder (or to "Uncategorised" via `folderId:null`).

### E. Company API
- `GET /api/companies` — public list, authenticated users. Filter by industry/category/q.
- `GET /api/companies/[slug]` — detail with verified contacts.
- `GET/POST /api/admin/companies` — admin queue + creation, with slug uniqueness handling (409 on conflict).
- `PATCH/DELETE /api/admin/companies/[id]` — partial update + hard delete (CoverLetters keep their `companyId` set null on delete).

### F. Tailored CV pipeline
- `lib/ai/prompts/tailorCV.ts` — system prompt with strict no-fabrication rules, JSON output contract, defensive parser, `applyTailorEdits()` that produces a NEW resume payload (immutable; uses `structuredClone`).
- `POST /api/ai/tailor-cv` — entitlement-gated (`canTailorForCompany`), rate-limited under `ai` bucket. Generates the tailored CV via the AI router, persists a NEW `Resume` row (source is untouched), and auto-surfaces it under "My Documents" as a `tailored_resume` document with `{ sourceResumeId, companyId, companySlug, rationale }` metadata.
- Response includes provider metadata (`provider, model, fellBack, durationMs`) for editor instrumentation.

### G. Resume version snapshots
- `lib/resume/versions.ts` — `shouldAutoPin(n, every=25)` + `maybeRecordAutoVersion(resumeId, currentData)`.
- `GET/POST /api/resumes/[id]/versions` — list versions, pin a named snapshot.
- Wired into `PUT /api/resumes/[id]`: before writing the new payload, the route reads the current `data` and auto-pins it as a snapshot every 25th save. Snapshots are revertible because we always store the pre-edit state.

### H. Playwright E2E scaffold
- `playwright.config.ts` — chromium + Pixel 7 mobile profiles, auto-boots `npm run dev` locally (CI mode skips it), HTML report retained, screenshots + video on failure.
- `tests/e2e/smoke.spec.ts` — landing page renders + auth-gated dashboard correctly bounces anonymous users to `/auth/login`.
- `npm run test:e2e` runs the suite. `npm run test:e2e:install` downloads browsers (one-time).
- `@playwright/test` added as dev dep.

### I. Seed extended
- 10 sample UAE companies seeded (Carrefour, Emirates, Etihad, Amazon.ae, Noon, ADNOC, Emaar, e&/Etisalat, du, Dubai Holding) with industry, category, HQ city, and descriptions.
- Re-runnable; idempotent upsert by slug.

### J. Tests
- `tests/lib/entitlements.test.ts` — FREE-tier contract.
- `tests/lib/resume/versions.test.ts` — auto-pin cadence + edge cases (0, negative, NaN, custom cadence).
- `tests/lib/ai/tailor.test.ts` — JSON parse (well-formed / fenced / garbage), edit application (summary override, role-matched bullet replace, dedupe skills, create skills group, no mutation of input).

## Verification checklist

```bash
npx prisma migrate dev --name add_folder_document_company_resumeversion
npm run seed
npm run typecheck
npm run test
npm run build
# After installing browsers once:
npm run test:e2e:install
npm run test:e2e
```

Manual smoke against the new endpoints (PowerShell, native):
```powershell
$cookie  = "<your-next-auth.session-token>"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$session.Cookies.Add((New-Object System.Net.Cookie("next-auth.session-token", $cookie, "/", "localhost")))

# Entitlements
Invoke-RestMethod -Uri http://localhost:3000/api/entitlements -WebSession $session | Format-List

# Folders
Invoke-RestMethod -Uri http://localhost:3000/api/folders -Method POST -WebSession $session -ContentType "application/json" `
  -Body (@{ name = "Engineering"; color = "#1e3a8a" } | ConvertTo-Json)
Invoke-RestMethod -Uri http://localhost:3000/api/folders -WebSession $session | Format-List

# Companies
Invoke-RestMethod -Uri "http://localhost:3000/api/companies?industry=tech" -WebSession $session | Format-List
Invoke-RestMethod -Uri http://localhost:3000/api/companies/noon -WebSession $session | Format-List

# Tailor CV (substitute resumeId from /api/resumes)
Invoke-RestMethod -Uri http://localhost:3000/api/ai/tailor-cv -Method POST -WebSession $session -ContentType "application/json" `
  -Body (@{ sourceResumeId = "<your-resume-id>"; companySlug = "noon" } | ConvertTo-Json) | Format-List
```

## What we deliberately did NOT do

- **Full editor UI rewrite.** Replacing the 800+ line `app/resume/[id]/page.tsx` is a sizeable UI effort that deserves its own phase pass. Phase 1 already swapped the in-editor PDF preview dialog to a true-PDF iframe (the most user-visible improvement). The split-pane rewrite + live React-PDF preview + multi-score badge integration lands in Phase 4b.
- **Folder UI / Document Manager screen.** Backend complete; the UI shell follows in Phase 4b alongside the editor rewrite.
- **Admin Company UI.** API complete; admin screen lands in Phase 5 (Admin Dashboard).
- **Sub-folders.** Folders are single-level. Nesting becomes a footgun in flat-list UIs; we'll add it only if user research demands it.
- **Migrate legacy `/api/payments/create` and `/api/payments/verify`.** They still wrap the old `lib/ziina.ts`; they keep working but should be sunset in Phase 5 alongside the admin payments UI build.

## Action items

1. `npx prisma migrate dev --name add_folder_document_company_resumeversion`
2. `npm install` (picks up `@playwright/test`)
3. `npm run seed` (seeds 10 companies; existing rows updated in place)
4. `npm run test:e2e:install` once, then `npm run test:e2e`

## Path to Phase 5

Reply **"approve phase 5"** to start:
- Admin dashboard rebuild — operational cockpit pulling everything we've built (payments queue, pricing CRUD, templates CRUD, companies CRUD, AI settings matrix, WhatsApp templates editor, audit log viewer).
- `AuditLog` + `ActivityLog` + `Notification` + `EmailCampaign` schema additions and the Resend wiring for transactional + broadcast email.
- Sweep the dynamic-server-usage build warnings (8 routes get `export const dynamic = 'force-dynamic'`).
- Sunset legacy `/api/payments/create` + `/api/payments/verify` routes and remove `lib/ziina.ts`.
