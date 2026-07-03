# Do Not Break — Critical Systems

These systems are live and directly affect revenue or user trust. Treat with extreme care.

---

## 🔴 Payment System

**Files:** `lib/payments/router.ts`, `lib/payments/ziina.ts`, `app/api/payments/`, `app/api/webhooks/ziina/`

**Rules:**
- Never modify payment status transitions outside the router
- Never skip coupon validation on the server
- Never expose `ZIINA_API_KEY` client-side
- Always verify Ziina webhook signature before processing
- Test both WhatsApp and Ziina rails after any payment-adjacent change

**If you break this:** Payments fail silently, users can't subscribe, revenue stops.

---

## 🔴 Authentication & Session

**Files:** `lib/auth.ts`, `middleware.ts`, `app/api/auth/`

**Rules:**
- Never remove `session.user.id` or `session.user.role` from the session callback
- Never disable middleware route protection
- Always check `requireAdmin()` in admin API routes
- Never store raw passwords — NextAuth handles hashing

**If you break this:** Users get locked out. Admin routes become publicly accessible.

---

## 🟠 Database Migrations

**Files:** `prisma/schema.prisma`, `prisma/migrations/`

**Rules:**
- Never edit existing migration SQL files
- Always create a new migration for schema changes
- Always test migration on a fresh DB before applying to production
- Use `DIRECT_URL` (port 5432) for migrations
- Never drop a column without confirming it's unused across ALL routes

**If you break this:** Production DB schema diverges, app crashes at runtime.

---

## 🟠 Resume PDF Export

**Files:** `lib/resume/engine/renderResume.ts`, `app/api/resumes/[id]/export/route.ts`

**Rules:**
- Both HTML template and React component rendering paths must work
- Test PDF output after any change to `renderResume.ts`
- Puppeteer runs server-side — keep it that way
- `metadata.isHtmlTemplate` determines which rendering path is used

**If you break this:** Users can't download resumes — the core product feature fails.

---

## 🟠 Template Registry

**Files:** `lib/resume/templates/registry.ts`, `app/api/resumes/templates/route.ts`

**Rules:**
- `registry.ts` is the single source of truth for all 24 templates
- The API route must read from the registry, not the DB
- Never hardcode template counts — derive from registry
- Adding a template requires updating BOTH the registry AND `app/templates/page.tsx`

**If you break this:** Template gallery shows wrong/missing templates.

---

## 🟡 Coupon System

**Files:** `lib/coupons/validate.ts`, `lib/payments/router.ts`, `app/api/coupons/`

**Rules:**
- Coupon discount MUST be re-validated server-side on every payment creation
- `usedCount` increment and `CouponUsage` creation must be atomic (same transaction)
- Never trust client-provided discount amounts
- Soft-delete only — never hard-delete coupons (breaks usage history)

**If you break this:** Users get incorrect prices or coupon abuse becomes possible.

---

## 🟡 Admin Role Checks

Every admin API route must have this pattern at the top:

```typescript
async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') return null
  return session
}
// At start of handler:
const session = await requireAdmin()
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

**If you skip this:** Any authenticated user can access admin data.

---

## 🟡 Environment Variables

All env vars are typed and validated in `lib/env.ts`. 

**Rules:**
- Never access `process.env.X` directly in business logic — always use `env.X`
- Never expose server-only env vars to client components
- `NEXT_PUBLIC_*` = safe for client. Everything else = server-only.

**If you break this:** Build fails or secrets leak to client bundle.
