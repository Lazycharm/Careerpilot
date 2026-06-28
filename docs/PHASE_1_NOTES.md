# Phase 1 — PDF + ATS Engine (delivery notes)

Status: **Complete, ready for review.**
Date: 2026-06-23

## Scope delivered

### A. React-PDF foundation
Replaces the broken html2canvas + jsPDF + Puppeteer + fly.dev-API pipeline
with a single, ATS-safe, server-side React-PDF renderer.

New modules:
- `lib/pdf/theme.ts` — design tokens + reusable stylesheet builder.
- `lib/pdf/fonts.ts` — font registration (built-ins for English, Noto Sans
  Arabic registered on demand for RTL).
- `lib/pdf/render.ts` — `renderResumeBuffer` + `renderResumeStream` server APIs.
- `lib/pdf/registry.ts` — single source of truth mapping template keys → React
  components + metadata.
- `lib/pdf/templates/_shared.tsx` — atomic components (`Section`, `BulletList`,
  `ContactRow`, `ExperienceHeader`) used by every template.

### B. First 4 of 12 ATS-safe templates
| Key | Name | Audience |
|---|---|---|
| `dubai-classic` | Dubai Classic | Banking, consulting, corporate |
| `abu-dhabi-executive` | Abu Dhabi Executive (premium) | Energy, government, legal, finance leadership |
| `sharjah-minimal` | Sharjah Minimal | Tech, design, startups |
| `gulf-modern` | Gulf Modern | Hospitality, retail, marketing |

All four are single-column, embed no images, and produce a real text layer
that any UAE ATS (Taleo, Workday, SuccessFactors, Oracle iRecruitment) parses
cleanly. Typical output: 10–60 KB.

### C. ATS multi-score engine (5 scores)
New `lib/ats/` module:
- `index.ts` — `analyzeResume()` orchestrator → returns `MultiScoreReport`.
- `types.ts` — shared scoring types.
- `scores/ats.ts` — structural parsing health + JD keyword coverage.
- `scores/recruiter.ts` — action-verb ratio, quantification, weak phrases, AI tells, bullet length.
- `scores/readability.ts` — Flesch Reading Ease + Flesch-Kincaid grade level.
- `scores/industryMatch.ts` — coverage of curated per-industry keyword sets.
- `scores/uaeHiring.ts` — region context, location, UAE phone format, Arabic, tenure pattern.
- `keywords/uae.ts` — curated keyword libraries (general + per-industry), strong verbs, weak phrases, AI tells.

### D. Wired into the live export route
- `app/api/resumes/[id]/export/route.ts` — went from 560 lines (Puppeteer +
  third-party API fallback + dev screenshots + console-log soup) to ~125 lines
  using the new React-PDF generator. All previous entitlement checks preserved.
- Rate limit applied via `lib/security/rate-limit.ts` (`ai` bucket).
- Hard-coded fallback to `html2pdf.fly.dev` removed (it was a security risk:
  resume PII to a third-party uncontracted endpoint).

### E. PDF generator compatibility layer
- `lib/resume/pdfGenerator.ts` rewritten as a thin wrapper over the new
  React-PDF renderer. The legacy export name `generateResumePDFServer(data,
  template)` is preserved so existing callers keep working.
- The browser-side `generateResumePDF` export was removed — clients should
  now fetch the server endpoint and `.blob()` the response. Phase 2 will
  also expose a true-PDF preview iframe in the editor.

### F. Dropped dependencies
Removed from `package.json`:
- `puppeteer` (~300 MB of Chromium on deploy, only used by the now-deleted code path)
- `html2canvas`
- `jspdf`

Added: `@react-pdf/renderer ^4.1.5`.

### G. Database baseline policy
- `prisma/BASELINE.md` documents the one-time baseline procedure to switch
  from `db push` history-less state to versioned migrations, without
  recreating the live DB.
- Future schema work follows `prisma/MIGRATIONS.md` policy.

## Verification checklist

After `npm install`:

- [ ] `npm run typecheck` passes for the new modules.
- [ ] `npm run build` succeeds.
- [ ] Render a CV via `GET /api/resumes/{id}/export` — response headers
      include `Content-Type: application/pdf` and the file opens in any
      PDF viewer.
- [ ] Open the downloaded PDF and select text with the cursor — text is
      selectable (proof of real text layer, not an image).
- [ ] File size is < 100 KB for a typical CV.
- [ ] Run `analyzeResume({ data, industry: 'tech', jobDescription })` from a
      Node script and confirm the report contains all 5 scores + issues.

## What we did NOT do in this phase

- Apply `schema.proposed.prisma` — handled by the named migrations roadmap
  in `prisma/BASELINE.md` over Phases 1–7.
- Build the remaining 8 of 12 templates — Phase 1 ships the first 4 production
  templates so the pipeline can be validated end-to-end. The remaining 8 are
  a straightforward fan-out using the same atoms; ideally produced from a
  designer-led Figma source.
- Replace the AI provider router (Phase 2).
- Build the `ATSReport` table or persist reports (waits for the Phase-1
  finalization migration `add_pdfexport_atsreport_tables`).
- PDF queue worker (BullMQ) — current export is synchronous and good for
  typical resume sizes. Async queue lands when bulk-export or automation
  needs it (Phase 4 / Phase 6).
- Visual-regression snapshot tests — needs Playwright in the repo (Phase 2
  testing setup).

## Path to next phase

Reply **"approve phase 2"** to execute Phase 2:
- AI provider router (Claude primary, OpenAI fallback) wired from `AISetting`.
- Resume editor rewrite with React-PDF live-preview iframe.
- Cover-letter generator with structured AI output (JSON, not free text).
- Anti-AI-tone prompt library.
- Vitest + Playwright + axe-core test scaffolding.
