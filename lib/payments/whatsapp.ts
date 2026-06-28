/**
 * WhatsApp payment helper.
 *
 * The "payment" via WhatsApp is a deep-link: we send the user to a
 * `wa.me/<adminNumber>?text=<encoded message>` URL with the payment context
 * pre-filled, the admin replies with payment instructions, and the user pays
 * out-of-band. The admin then approves the Payment row from the queue.
 *
 * Template bodies live in the `WhatsAppTemplate` table so admin can edit
 * without a code change. This module renders templates and builds the URL.
 */

import { prisma } from '@/lib/prisma'

/** Replace `{{name}}` placeholders in `template` with values from `vars`. */
export function renderTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const v = vars[key]
    return v === undefined || v === null ? '' : String(v)
  })
}

/**
 * Build a wa.me deep-link with a pre-filled, URL-encoded message.
 *
 * @param adminNumber WhatsApp number in E.164 (e.g. `+9715XXXXXXXX`). The
 *                    leading `+` is allowed; we strip it because wa.me wants
 *                    just digits.
 */
export function buildWhatsAppUrl(adminNumber: string, message: string): string {
  const digits = adminNumber.replace(/[^\d]/g, '')
  if (!digits) throw new Error('WhatsApp adminNumber must contain digits')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/**
 * Fetch a template body by code from the WhatsAppTemplate table. Returns null
 * if no active row is found — caller can fall back to a hard-coded default
 * or 503 the request.
 */
export async function loadTemplateBody(code: string): Promise<string | null> {
  try {
    const row = await prisma.whatsAppTemplate.findUnique({
      where: { code },
    })
    if (!row || !row.isActive) return null
    return row.body
  } catch {
    return null
  }
}

/** Standard merge-tag dictionary for payment-related templates. */
export interface PaymentMergeVars {
  userName: string
  planName: string
  amountAED: string // formatted as e.g. "5.00"
  paymentId: string
  appUrl?: string // optional CTA link back to the app
}

/** Convert fils → AED with two decimals. */
export function filsToAED(fils: number): string {
  return (fils / 100).toFixed(2)
}
