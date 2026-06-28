# Phase 7 — Programmatic SEO, Notifications, Pre-launch

Status: **Complete, ready for launch QA.**
Date: 2026-06-23

## Scope delivered

### A. Schema additions (additive — final migration of the rebuild)
- `BlogPost` — MDX bodies stored in DB, no CMS dependency.
- `IndustryPage` — admin-overridable industry landing page content.
- `CityPage` — admin-overridable city page content.

**Migration:**
```bash
npx prisma migrate dev --name add_seo_content_models
```

### B. Curated SEO data (`lib/seo/data.ts`)
6 industries × 6 roles × 7 cities seed catalogue with:
- Stable URL-safe slugs (regression-tested).
- 100–200 char meta descriptions (Google snippet-safe).
- 3-paragraph original body content per slug.
- FAQ pairs for industries (FAQPage JSON-LD).
- Linked template registry keys (cross-checked against `lib/pdf/registry.ts` in tests).

### C. Programmatic SEO pages
| Route | Source | ISR | Notes |
|---|---|---|---|
| `/resume-templates/[industry]` | curated data | static | FAQ JSON-LD, breadcrumb-aware related links |
| `/cv-for/[role]` | curated data | static | breadcrumb JSON-LD |
| `/jobs/[city]` | curated data | static | UAE emirate landing pages |
| `/companies/[slug]` | `Company` table | revalidate=3600 | Organization JSON-LD, OG image from `logoUrl` |
| `/blog` | `BlogPost` table | revalidate=3600 | reverse-chronological index |
| `/blog/[slug]` | `BlogPost` table | revalidate=3600 | Article JSON-LD, OG metadata |

All four programmatic surfaces share `components/seo/SEOLanding.tsx` so layout
+ CTA + FAQ + related-links shape stays consistent.

### D. Sitemap + robots
- `app/sitemap.ts` rebuilt to emit static pages + every programmatic surface +
  DB-driven companies and blog posts. Wrapped in try/catch so a transient DB
  hiccup at build time yields a static-only sitemap rather than a build crash.
- `app/robots.ts` tightened to block `/documents/`, `/automation/`, `/subscription/`,
  `/payments/` in addition to the existing private routes.

### E. Notifications surface
- `GET /api/notifications` → 50 newest + unread count.
- `POST /api/notifications/[id]/read` → mark one.
- `POST /api/notifications/read-all` → mark all.
- `components/shared/NotificationBell.tsx` — drop-in bell with badge + dropdown
  panel + click-outside dismiss + 30 s polling. Wire into your navbar.
- `components/shared/RecentActivity.tsx` — dashboard card showing the 8 newest
  ActivityLog events with human labels.

### F. Pre-launch QA package
- `docs/PRE_LAUNCH_CHECKLIST.md` — 16 sections, each a hard gate:
  secrets, database, auth, payments, deliverability, cron, OAuth, Lighthouse
  budget, axe sweep, SEO, observability, security headers, code health,
  legal content, DNS, rollback.

### G. Tests
- `tests/lib/seo/data.test.ts` — slug uniqueness, kebab-case format, meta
  description length budget, template-key referential integrity, find-helper
  correctness.

## Verification checklist

```bash
npx prisma migrate dev --name add_seo_content_models
npm run typecheck
npm run test            # should be 84/84 (76 + 8 new)
npm run build
```

End-to-end smoke (after deploy):

1. Visit `/resume-templates/tech` → page renders, FAQ accordion works, template cards link to `/products?focus=…`.
2. Visit `/cv-for/software-engineer` → breadcrumb JSON-LD present in HTML.
3. Visit `/jobs/dubai` → page renders with related industry links.
4. Visit `/companies/noon` → org JSON-LD + the seed body content.
5. `curl https://<domain>/sitemap.xml | head -50` → see all the URLs.
6. `curl https://<domain>/robots.txt` → confirm disallow list updated.
7. Trigger a payment → notification appears in the bell after page reload, dashboard recent-activity widget updates.

## What we deliberately did NOT do

- **MDX rendering** for blog posts. Phase 7 ships `bodyMdx` as preserved plain
  text inside a `whitespace-pre-wrap` container. Real MDX with components,
  syntax highlighting, and image embeds lands when content marketing actually
  needs it.
- **Automation wizard UI shell** (`/automation` + `/automation/email-accounts`).
  The backend is complete; the UI is a multi-screen flow that warrants its
  own focused sprint. Until shipped, admins can connect Gmail by visiting
  `/api/email-accounts/oauth/google/start` directly and create automations
  via the `POST /api/automations` endpoint.
- **NotificationBell + RecentActivity wired into the existing Navbar.** They
  are drop-in components — adding them takes one import + one line of JSX
  each in `components/shared/Navbar.tsx`. Left undone here so the styling
  pass can be done coherently across the navbar at once.
- **IndustryPage / CityPage admin override layer.** Schema is in place; the
  page templates currently read from `lib/seo/data.ts` only. Phase 7b adds
  the admin override layer that merges DB content on top of the curated
  defaults.

## Path forward

Phase 7 is the last build phase of the rebuild. The Pre-launch Checklist
(`docs/PRE_LAUNCH_CHECKLIST.md`) is the gate to production.

**After launch — Phase 8 / continuous:**
- Automation wizard UI + email-accounts dashboard screen.
- Notification bell + recent-activity wired into the Navbar.
- Admin overrides for IndustryPage / CityPage.
- Real MDX renderer for blog posts.
- Bulk email campaign drainer (cron-based) so scheduled campaigns auto-send.
- Bounce / failure handling + retry/backoff in automation runner.
- Lighthouse + axe enforced in CI as quality gates.
