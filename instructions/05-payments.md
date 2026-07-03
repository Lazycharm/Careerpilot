# Payment System Deep-Dive

## Overview

CareerPilot uses a dual-rail payment system. All payment creation goes through a single function:

```typescript
import { createPayment } from '@/lib/payments/router'
```

This is the ONLY entry point. Never create Payment rows directly anywhere else.

## Rails

### WhatsApp Rail
1. User clicks pay → `POST /api/payments/intent` with `method: 'whatsapp'`
2. Payment row created with `status: 'pending_whatsapp'`
3. WhatsApp message rendered using admin-configured template
4. User redirected to `wa.me/<adminNumber>?text=<encodedMessage>`
5. Admin receives message, confirms payment manually
6. Admin visits `/admin/payments` → clicks Approve
7. `approvePayment()` called → status becomes `approved`

### Ziina Rail
1. User clicks pay → `POST /api/payments/intent` with `method: 'ziina'`
2. Payment row created with `status: 'pending_ziina'`
3. Ziina intent created via `lib/payments/ziina.ts`
4. User redirected to Ziina checkout page
5. On success: Ziina fires webhook to `POST /api/webhooks/ziina`
6. `markZiinaCompleted()` called → status becomes `approved`
7. On failure: `markZiinaFailed()` called → status becomes `failed`

## Coupon Flow

Coupon discount is resolved BEFORE the payment row is created:

```
validateCoupon(code, pricingCode, amountFils, userId)
  → returns { discountFils, finalAmountFils }
  → Payment row stores amountFils = finalAmountFils
  → couponId stored on Payment row
  → CouponUsage row created after payment row saved
  → Coupon.usedCount incremented (atomic transaction)
```

Both rails always charge `finalAmountFils` — the coupon is transparent to the rail.

## Amount Convention

All amounts are stored in **fils** (1/100 of AED). 
- 1000 fils = 10.00 AED
- 3900 fils = 39.00 AED

Never store AED floats in the DB. Always convert: `Math.round(aed * 100)`.

Helper: `filsToAED(fils: number): string` in `lib/payments/whatsapp.ts`

## Payment Statuses

| Status | Meaning |
|---|---|
| `pending_whatsapp` | User sent WhatsApp message, waiting for admin approval |
| `pending_ziina` | User redirected to Ziina, waiting for webhook |
| `approved` | Payment confirmed, subscription should be activated |
| `rejected` | Admin rejected WhatsApp payment |
| `failed` | Ziina payment failed or was cancelled |

## Admin Controls

- `/admin/settings` — enable/disable WhatsApp rail, enable/disable Ziina rail
- `/admin/settings` — set WhatsApp admin number, set request message template
- `/admin/payments` — list all payments, approve/reject WhatsApp payments
- `lib/payments/settings.ts` — `getPaymentSettings()` reads current config

## Files Reference

| File | Purpose |
|---|---|
| `lib/payments/router.ts` | `createPayment()`, `approvePayment()`, `markZiinaCompleted()` |
| `lib/payments/ziina.ts` | Ziina API SDK wrapper |
| `lib/payments/whatsapp.ts` | WhatsApp URL builder, template renderer |
| `lib/payments/settings.ts` | Reads payment settings from DB |
| `lib/coupons/validate.ts` | Coupon validation logic |
| `app/api/payments/intent/route.ts` | POST endpoint — creates payment intent |
| `app/api/payments/methods/route.ts` | GET endpoint — returns enabled methods |
| `app/api/webhooks/ziina/route.ts` | Ziina webhook handler |
| `app/api/admin/payments/` | Admin payment management APIs |

## ⚠️ Critical Rules

1. **Never create a Payment row outside `lib/payments/router.ts`**
2. **Never expose `ZIINA_API_KEY` or `ZIINA_WEBHOOK_SECRET` client-side**
3. **Always verify Ziina webhook signature before processing**
4. **Coupon `usedCount` must be incremented in the same transaction as `CouponUsage` creation**
5. **`approvePayment()` does NOT yet activate the subscription** — this is a known gap (see `instructions/04-features.md` → Pending)
