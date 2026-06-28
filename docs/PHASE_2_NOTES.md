# Phase 2 — AI Router + Cover Letter Rebuild + Test Scaffolding

Status: **Complete, ready for review.**
Date: 2026-06-23

## Scope delivered

### A. Seed script
- `scripts/seed.ts` — idempotent. Seeds the 4 React-PDF templates from the
  registry, the admin user (from `ADMIN_EMAIL` + `ADMIN_PASSWORD` env, min 12
  chars), and default platform settings. Re-runs cleanly. `package.json` gets a
  `npm run seed` script.
- Old `scripts/setup.ts` kept in place for now; the new seed supersedes it.

### B. AISetting model (additive)
Added to live `prisma/schema.prisma`:
- enums `AIProviderCode { claude openai mock }` and `AIUseCase { … 9 cases … }`
- model `AISetting` — one row per use-case, admin-editable, with primary/fallback
  provider, model, temperature, maxTokens, systemPrompt, isEnabled.

**Run this migration when you're ready:**
```bash
npx prisma migrate dev --name add_aisetting_table
```

The router gracefully degrades when the table doesn't exist yet (uses env
defaults), so the app stays working between schema commit and migration run.

### C. AI provider router
New module `lib/ai/`:
- `providers/types.ts` — `AIProvider` interface + `AIProviderError`.
- `providers/claude.ts` — Anthropic Messages API via fetch. No SDK dependency.
- `providers/openai.ts` — Chat Completions via fetch. Honors `OPENAI_BASE_URL`.
- `providers/mock.ts` — deterministic canned responses for dev / CI.
- `router.ts` — `aiGenerate({ useCase, prompt, json?, userId? })` resolves the
  per-use-case primary provider, falls back on error, tracks usage in `AIUsage`.

Resolution order: AISetting row (60s cache) → env defaults → final mock fallback.
Honors `AI_DEMO_MODE=true` globally.

### D. Anti-AI-tone prompt library
- `lib/ai/prompts/style.ts` — `STYLE_GUARDRAILS`, `ANTI_AI_TONE`, `HUMAN_VOICE`
  building blocks composed into every system prompt.
- `lib/ai/prompts/coverLetter.ts` — system prompt with JSON output contract,
  user prompt builder, JSON→string renderer, defensive parser that strips
  markdown fences and falls back gracefully on invalid JSON.

### E. Cover letter API rewrite
- `app/api/ai/cover-letter/route.ts` — routes through the new router with JSON
  output mode. Public request/response shape preserved so existing UI keeps
  working. Adds rate limiting, structured logging, and richer hydration of
  candidate context (location, summary, experience, skills) into the prompt.
- Response now includes `meta: { provider, model, fellBack, durationMs }` so
  the editor can show which provider produced the text.

### F. ATS analyze API
- `app/api/ai/ats-analyze/route.ts` — new endpoint that runs the 5-score
  engine (`analyzeResume`) and returns the full `MultiScoreReport`. Persistence
  to `ATSReport` lands in Phase 3.
- Old `/api/ai/resume-optimize` route untouched (text-rewrite contract).

### G. Vitest scaffolding + tests
- `vitest.config.ts` with `vite-tsconfig-paths` for `@/*` resolution.
- `npm run test` and `npm run test:watch` scripts.
- Fixtures: `tests/fixtures/resume.ts` — `fullResume`, `minimalResume`,
  `cliCheResume` shared across suites.
- Suites:
  - `tests/lib/ats/index.test.ts` — orchestrator integration: all 5 scores,
    issue dedup + sort, JD keyword coverage, AI-cliché detection.
  - `tests/lib/ats/scores.test.ts` — per-scorer intent assertions covering
    `scoreATS`, `extractKeywords`, `scoreRecruiter`, `scoreReadability`,
    `scoreIndustryMatch`, `scoreUAEHiring`.
  - `tests/lib/ai/prompts.test.ts` — JSON parse + render + system-prompt
    composition (ensures style guardrails are embedded).
  - `tests/lib/ai/router.test.ts` — demo-mode mock-fallback path.

## Verification checklist

```bash
npm install                                  # picks up vitest, vite-tsconfig-paths
npx prisma migrate dev --name add_aisetting_table
npm run seed                                 # creates admin + templates + settings
npm run typecheck
npm run test                                 # all suites should pass
npm run build
```

Then:
- Open `/api/ai/cover-letter` from the UI; the cover letter should be human-
  sounding and the response `meta.provider` should match your env (or `mock`
  if no AI keys).
- Hit `/api/ai/ats-analyze` with a structured resume payload and confirm the
  5 scores come back.

## What we deliberately did NOT do

- Migrate the other 6 AI routes off `lib/ai.ts` — those land alongside the
  editor rewrite in Phase 4 to avoid touching the editor twice.
- Build the admin UI for editing AISetting rows — Phase 5 (Admin Dashboard).
- Persist ATS reports to a table — needs the `ATSReport` model in the
  additive migration roadmap (Phase 3 finalization).
- Playwright E2E. The Vitest scaffold is enough for the layers we built in
  Phase 2; Playwright lands in Phase 4 with the editor rewrite where end-to-end
  flows actually exist to test.

## Path to Phase 3

Reply **"approve phase 3"** to start:
- Additive migrations: `Payment`, `Pricing`, `WhatsAppTemplate`, plus extracting
  payment state out of `Subscription`.
- WhatsApp deep-link payment flow + admin queue (pending / approved / rejected).
- Ziina rebuild against the documented API (HMAC verify + IP allowlist).
- Admin Settings → Payments toggle (`whatsappEnabled`, `ziinaEnabled`) wiring
  driven by feature flags.
- `/api/v1/payments/methods` resolving enabled methods at request time.
