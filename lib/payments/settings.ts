/**
 * Payment settings — admin-editable toggles + values stored in the existing
 * `Setting` key/value table.
 *
 * Settings keys live here so we don't typo them across the codebase.
 * Phase 5 (admin dashboard) will surface these in the UI.
 */

import { prisma } from '@/lib/prisma'

export const PAYMENT_SETTING_KEYS = {
  whatsappEnabled: 'payments.whatsapp.enabled',
  whatsappAdminNumber: 'payments.whatsapp.adminNumber',
  whatsappTemplateCode: 'payments.whatsapp.requestTemplateCode',
  ziinaEnabled: 'payments.ziina.enabled',
  ziinaTestMode: 'payments.ziina.testMode',
} as const

export interface PaymentSettings {
  whatsapp: {
    enabled: boolean
    adminNumber: string | null
    requestTemplateCode: string
  }
  ziina: {
    enabled: boolean
    testMode: boolean
  }
}

let cache: { value: PaymentSettings; expiresAt: number } | null = null
const TTL_MS = 30_000

/** Read all payment settings with a small in-process cache (30 s). */
export async function getPaymentSettings(force = false): Promise<PaymentSettings> {
  if (!force && cache && Date.now() < cache.expiresAt) return cache.value

  const rows = await prisma.setting.findMany({
    where: { key: { in: Object.values(PAYMENT_SETTING_KEYS) } },
  })
  const byKey = new Map(rows.map((r) => [r.key, r.value]))

  const value: PaymentSettings = {
    whatsapp: {
      enabled: parseBool(byKey.get(PAYMENT_SETTING_KEYS.whatsappEnabled), false),
      adminNumber: byKey.get(PAYMENT_SETTING_KEYS.whatsappAdminNumber) ?? null,
      requestTemplateCode:
        byKey.get(PAYMENT_SETTING_KEYS.whatsappTemplateCode) ?? 'payment_request',
    },
    ziina: {
      enabled: parseBool(byKey.get(PAYMENT_SETTING_KEYS.ziinaEnabled), false),
      testMode: parseBool(byKey.get(PAYMENT_SETTING_KEYS.ziinaTestMode), false),
    },
  }

  cache = { value, expiresAt: Date.now() + TTL_MS }
  return value
}

/** Test/admin hook — call after writing a setting so callers see fresh state. */
export function clearPaymentSettingsCache(): void {
  cache = null
}

function parseBool(v: string | undefined, fallback: boolean): boolean {
  if (v === undefined) return fallback
  return v === 'true' || v === '1' || v === 'yes'
}
