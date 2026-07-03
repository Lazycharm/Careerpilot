# Pricing Strategy & Coupon System

## Pricing Plans

All plans are seeded via `prisma/seed_pricing.sql`. Run it once in Supabase SQL Editor.

| Code | Name | Price | Duration | Target User |
|---|---|---|---|---|
| `starter` | Starter Bundle | 10 AED | 30 days | First-time users, testing the platform |
| `pro` | Pro Bundle | 39 AED/mo | 30 days | Active job seekers, unlimited everything |
| `pro_annual` | Pro Annual | 299 AED/yr | 365 days | Committed users (saves 169 AED vs monthly) |
| `automation` | Automation | 29 AED/mo | 30 days | Users who want auto job applications only |
| `growth` | Growth Bundle | 59 AED/mo | 30 days | Power users — Pro + Automation combined |

### Pricing Logic

The `features` JSON on each Pricing row controls what the plan unlocks:

```json
// Starter
{"downloads": 5, "coverLetters": 5, "interviews": 3, "automation": false, "tailored": false}

// Pro / Pro Annual
{"downloads": -1, "coverLetters": -1, "interviews": -1, "automation": false, "tailored": true}

// Automation
{"downloads": 0, "coverLetters": 0, "interviews": 0, "automation": true, "tailored": false}

// Growth
{"downloads": -1, "coverLetters": -1, "interviews": -1, "automation": true, "tailored": true}
```

`-1` means unlimited. `lib/entitlements.ts` reads these values to gate features.

## Coupon System

### Psychological Anchor Strategy

The Starter Bundle is **10 AED** (the anchor price — feels cheap, low risk).
Coupons like `WELCOME50` make it **5 AED** — feels like a steal and drives first purchase.
Once they're in, upsell to Pro.

### How Coupons Work

1. Admin creates coupon at `/admin/coupons`
2. User enters code on `/subscription` page
3. Frontend calls `POST /api/coupons/validate` — returns `discountFils` + `finalAmountFils`
4. Strikethrough original price shown, discounted price becomes the CTA amount
5. On checkout, `couponCode` passed to `POST /api/payments/intent`
6. Server re-validates coupon (never trust client-side price), applies discount
7. Payment row stores `amountFils = finalAmountFils`, `discountFils`, `couponId`
8. `CouponUsage` row created + `Coupon.usedCount` incremented atomically

### Coupon Fields

| Field | Type | Notes |
|---|---|---|
| `code` | String | Unique, auto-uppercased |
| `discountType` | `percent` \| `fixed` | percent: 0-100; fixed: AED fils |
| `discountValue` | Float | For percent: 50 = 50%. For fixed: stored in fils |
| `maxUses` | Int? | null = unlimited |
| `usedCount` | Int | Auto-incremented |
| `expiresAt` | DateTime? | null = never expires |
| `applicableTo` | String[] | `['all']` or specific plan codes |
| `minAmountFils` | Int? | Minimum order to apply coupon |
| `isActive` | Boolean | Soft-delete via deactivation |

### Suggested Launch Coupons

| Code | Type | Value | Use Case |
|---|---|---|---|
| `WELCOME50` | percent | 50 | Onboarding — makes Starter 5 AED |
| `UAE10` | fixed | 1000 fils (10 AED) | Social/influencer promo |
| `ANNUAL20` | percent | 20 | Push annual plan uptake |
| `EARLYBIRD` | percent | 30 | Launch week special |

### Admin Coupon Page

Located at `/admin/coupons`. Features:
- Create form (all fields, plan restrictions, expiry)
- Live list with usage counter and status badge
- Toggle active/inactive
- Soft-delete (preserves usage history for audit)

### Validation Rules (enforced server-side)

1. Coupon must be `isActive: true`
2. Must not be expired (`expiresAt > now()`)
3. `usedCount < maxUses` (if maxUses set)
4. `applicableTo` must include the plan code or `'all'`
5. `amountFils >= minAmountFils` (if set)
6. User must not have used this coupon before (checked via `CouponUsage`)

All 6 checks run server-side in `lib/coupons/validate.ts`. Client-side validation is UX only — never trusted for pricing.
