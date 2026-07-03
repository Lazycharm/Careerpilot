# Admin System

## Access

Admin role is set on the `User` model: `role: 'admin'`.

All admin pages check `session.user.role === 'admin'` via `useSession()`.
All admin API routes call `requireAdmin()` which checks the server session.

To grant admin access: update the user's role in Supabase directly or via `/api/admin/users/[id]`.

## Admin Pages

| Route | Purpose |
|---|---|
| `/admin` | Dashboard — stats, AI usage table, quick action cards |
| `/admin/users` | List users, search, view profiles, override plans |
| `/admin/settings` | Platform-wide settings (homepage CMS, AI, payments, limits) |
| `/admin/analytics` | Platform analytics and charts |
| `/admin/templates` | Resume template management (seed, list, create HTML templates) |
| `/admin/coupons` | Create and manage coupon codes |
| `/admin/cover-letters` | Cover letter template management |
| `/admin/companies` | Target company database for automation |
| `/admin/email-campaigns` | Create and send marketing email blasts |
| `/admin/automations` | Monitor all user automations and run logs |
| `/admin/audit-logs` | Security audit trail |

## Admin API Routes

| Endpoint | Purpose |
|---|---|
| `GET /api/admin/stats` | Dashboard stats |
| `GET/POST /api/admin/coupons` | List / create coupons |
| `PATCH/DELETE /api/admin/coupons/[id]` | Update / deactivate coupon |
| `GET /api/admin/users` | List users |
| `PUT /api/admin/users/[id]/subscription` | Override user plan |
| `POST /api/admin/users/[id]/usage-reset` | Reset monthly AI usage |
| `GET/POST /api/admin/payments` | List / manage payments |
| `POST /api/admin/payments/[id]/approve` | Approve WhatsApp payment |
| `POST /api/admin/payments/[id]/reject` | Reject WhatsApp payment |
| `GET/PUT /api/admin/settings` | Read/write platform settings |
| `GET/POST /api/admin/templates` | Template management |
| `POST /api/resumes/seed-templates` | Seed templates from code registry |

## Settings System

Settings are stored as `Setting` rows (key + value strings). Helpers:

```typescript
import { getSettingAsBoolean, getSettingAsNumber, getSettingAsString } from '@/lib/settings'

const enabled = await getSettingAsBoolean('subscription_enabled')
const limit = await getSettingAsNumber('ai_resume_limit_free')
const adminPhone = await getSettingAsString('whatsapp_admin_number')
```

Setting keys in use:
- `subscription_enabled`
- `subscription_price`
- `resume_download_price`
- `cover_letter_price`
- `whatsapp_enabled`
- `whatsapp_admin_number`
- `whatsapp_request_template_code`
- `ziina_enabled`
- `ziina_test_mode`
- `ai_resume_limit_free`
- `ai_resume_limit_pro`
- `ai_cover_letter_limit_free`
- `ai_cover_letter_limit_pro`
- `ai_interview_limit_free`
- `ai_interview_limit_pro`

## Loading States

Admin pages use skeleton loading via `app/admin/loading.tsx` (Next.js Suspense) for the entire admin subtree, plus individual `loading` state skeletons inside each page component.

## Template Seeder

Admin dashboard has a "Seed Templates" quick action that calls `POST /api/resumes/seed-templates`. This syncs the code registry to the DB `ResumeTemplate` table — useful for one-time setup but templates are now read directly from the registry at runtime.
