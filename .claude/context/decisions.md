# Architectural Decisions — Already Made

These decisions are final. Do not re-litigate or suggest alternatives unless Ayoub asks.

---

## Templates Are Code, Not DB

**Decision:** Resume templates are defined in `lib/resume/templates/registry.ts` (code), not the `ResumeTemplate` DB table.

**Why:** DB-only approach required manual seeding in production and caused the "only 4 templates showing" bug. Code is always in sync with deployment.

**Impact:** `/api/resumes/templates` reads from the registry. Adding a template = edit the registry file + add to `/app/templates/page.tsx`.

---

## Dual-Rail Payments

**Decision:** Two payment methods exist simultaneously — WhatsApp (manual) and Ziina (online). Admin can enable/disable each independently.

**Why:** Ziina provides instant online payment; WhatsApp serves users who prefer manual/cash/bank transfer. UAE market expects flexibility.

**Impact:** All payment creation goes through `lib/payments/router.ts`. Never bypass it.

---

## Fils as Currency Unit

**Decision:** All amounts stored in fils (1/100 AED) as integers. Never store AED floats.

**Why:** Float arithmetic causes rounding errors in financial calculations. Integer fils is exact.

**Impact:** `amountFils: 3900` = 39.00 AED. Display converts via `filsToAED()`.

---

## Coupon Discounts Are Server-Side Only

**Decision:** Client-side coupon validation is UX feedback only. The actual discount is re-validated and applied server-side in `lib/payments/router.ts`.

**Why:** Client-side price can be tampered. User could manipulate the amount before calling `/api/payments/intent`. Server is always the authority on price.

**Impact:** Always pass `couponCode` to the intent endpoint — never pass a pre-discounted amount.

---

## Soft-Delete for Coupons

**Decision:** Deleting a coupon deactivates it (`isActive: false`), never hard-deletes.

**Why:** `CouponUsage` rows reference the coupon. Hard delete breaks audit trail.

**Impact:** "Deleted" coupons still appear in the DB — query `WHERE isActive = true` for active ones.

---

## NextAuth.js for Auth

**Decision:** NextAuth.js with credentials + Google OAuth. Custom session callbacks add `user.id` and `user.role` to the session.

**Why:** Already implemented and battle-tested. Switching would break all sessions.

**Impact:** Access user identity server-side via `getServerSession(authOptions)`. Client-side via `useSession()`.

---

## Supabase PostgreSQL — Two Connection Strings

**Decision:** `DATABASE_URL` uses pooled connection (port 6543) for runtime. `DIRECT_URL` uses direct connection (port 5432) for Prisma migrations.

**Why:** Supabase's pgBouncer pooler doesn't support the DDL queries Prisma uses in migrations.

**Impact:** Never run `prisma migrate` with `DATABASE_URL`. Always ensure both env vars are set.

---

## Skeleton Loading, Not Spinners

**Decision:** All pages use `Skeleton` components (`animate-pulse`) for loading states, not full-page spinners.

**Why:** Spinners block perceived performance. Skeletons feel faster and more modern. They also prevent layout shift.

**Pattern:**
```tsx
if (status === 'loading' || (status === 'authenticated' && loading)) {
  return <SkeletonLayout />
}
```
Note: `status === 'authenticated' && loading` — NOT just `loading` — to avoid blocking on the auth check itself.

---

## Admin Settings as DB Key-Value

**Decision:** Platform settings (AI limits, payment toggles, etc.) are stored as `Setting` rows, not env vars or config files.

**Why:** Allows admin to change settings at runtime without redeployment.

**Impact:** Read via `lib/settings.ts`. Never hardcode settings values in business logic.
