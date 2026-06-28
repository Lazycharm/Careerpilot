# Phase 0 — Foundation Reset (delivery notes)

Status: **Complete, ready for review.**
Date: 2026-06-23

## What this phase did (and didn't do)

**Scope of Phase 0:** non-destructive foundation. Nothing in the existing app's
runtime behavior changes. No API routes, no UI, no DB schema modified.

Files **created**:
- `instrumentation.ts` — Next.js instrumentation entry, wires Sentry when DSN present.
- `sentry.server.config.ts`, `sentry.edge.config.ts`, `sentry.client.config.ts`.
- `lib/env.ts` — Zod-validated environment loader; type-safe access; fail-fast on boot.
- `lib/security/rate-limit.ts` — Upstash-backed rate limiter (no-op fallback in dev).
- `lib/security/audit.ts` — audit helper; logs to stdout until `AuditLog` table lands in Phase 1.
- `.github/workflows/ci.yml` — lint, typecheck, build on every PR.
- `.prettierrc.json`, `.prettierignore` — formatting baseline.
- `prisma/MIGRATIONS.md` — policy: `db push` is forbidden; use `migrate`.
- `prisma/schema.proposed.prisma` (from previous turn) — Phase 1 schema target.
- `docs/DESIGN.md` (from previous turn) — full system design.

Files **modified**:
- `next.config.js` — security headers (HSTS, X-Frame-Options, Permissions-Policy, CSP report-only), image remote patterns, `serverComponentsExternalPackages` for puppeteer + react-pdf, gzip enabled, `poweredByHeader` disabled.
- `tsconfig.json` — target ES2022; added `noImplicitOverride`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`; excluded `.next` and `dist`.
- `.eslintrc.json` — explicit rules (eqeqeq, no-debugger, no-console with allow list, prefer-const), ignore patterns.
- `.env.example` — every variable the platform uses, grouped and documented.
- `package.json` — new scripts (`typecheck`, `format`, `db:migrate`, `db:deploy`); blocked `db:push`; added `@sentry/nextjs`, `@upstash/ratelimit`, `@upstash/redis`, `prettier`, `prettier-plugin-tailwindcss`.

## What you need to do before Phase 1

1. **Install new deps**:
   ```bash
   npm install
   ```

2. **Copy and fill env vars**:
   ```bash
   cp .env.example .env.local
   ```
   For local dev you only strictly need the Core block. AI/Payments/Sentry/Upstash
   all degrade gracefully when absent.

3. **Generate a long NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

4. **Generate an ENCRYPTION_KEY** (used in Phase 1 for PII encryption):
   ```bash
   openssl rand -base64 32
   ```

5. **Confirm CI runs green** by opening any small PR to `main`. The CI job
   will fail if env validation breaks the build — the CI workflow provides
   placeholder values for build-time only.

## What we deliberately did NOT do (waiting for Phase 1)

- Apply `schema.proposed.prisma`. Phase 1 baselines the current DB and
  incrementally migrates toward the target.
- Replace `bcryptjs` with `argon2`. Touch later when auth surfaces are rewritten.
- Switch `lib/ai.ts` codepaths. Provider router lands in Phase 2.
- Remove `puppeteer` from deps. Will be dropped when React-PDF lands in Phase 1.
- Touch any existing API route. The current app still works as-is.

## Verification checklist

After `npm install`:

- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes (or only emits pre-existing warnings).
- [ ] `npm run build` succeeds with the new headers + env loader.
- [ ] `npm run dev` boots; visiting `/` works as before.
- [ ] Response headers on any page include `Strict-Transport-Security`,
      `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`,
      `Content-Security-Policy-Report-Only`.
- [ ] `npm run db:push` is blocked with the migration policy message.

## Approval gate

If verification passes, reply **"approve phase 1"** and I will execute Phase 1:
- Baseline migration of the current schema
- React-PDF foundation (drop html2canvas + jsPDF + puppeteer)
- First 4 of 12 ATS templates with visual-regression tests
- ATS multi-score engine (5 scores)
- Wire the PDF queue (Upstash + worker)

If anything in Phase 0 needs to change, send the specific edits.
