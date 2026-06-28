/**
 * Email template builders — small, deliberate, plain HTML.
 *
 * No framework, no template engine. The platform's transactional surface is
 * narrow (payment outcomes, password reset, welcome) and these templates
 * inline their styles so they render predictably in Gmail / Outlook / Apple
 * Mail. Each builder returns `{ subject, html, text }` ready to hand to
 * `sendEmail()`.
 *
 * Visual style intentionally minimal — we'll layer brand polish in Phase 7
 * alongside marketing emails.
 */

import { env } from '@/lib/env'

interface BaseLayout {
  preheader?: string
  heading: string
  bodyHtml: string
  ctaLabel?: string
  ctaUrl?: string
  footerNote?: string
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function layout(opts: BaseLayout): string {
  const cta = opts.ctaLabel && opts.ctaUrl
    ? `<p style="margin:24px 0;">
         <a href="${escapeHtml(opts.ctaUrl)}"
            style="display:inline-block;background:#1e3a8a;color:#fff;text-decoration:none;
                   padding:12px 18px;border-radius:6px;font-weight:600;">
           ${escapeHtml(opts.ctaLabel)}
         </a>
       </p>`
    : ''
  const footer = opts.footerNote
    ? `<p style="font-size:12px;color:#6b7280;margin-top:32px;">${escapeHtml(opts.footerNote)}</p>`
    : ''
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(opts.heading)}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;line-height:1.5;">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(opts.preheader)}</div>` : ''}
<div style="max-width:560px;margin:24px auto;padding:24px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
  <h1 style="font-size:18px;margin:0 0 16px;">${escapeHtml(opts.heading)}</h1>
  <div style="font-size:14px;">${opts.bodyHtml}</div>
  ${cta}
  ${footer}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 12px;">
  <p style="font-size:12px;color:#6b7280;margin:0;">CareerPilot · UAE</p>
</div>
</body></html>`
}

function plainText(parts: string[]): string {
  return parts.filter(Boolean).join('\n\n')
}

// Defensive default: in test mode the env loader returns raw process.env so
// the schema's .default() doesn't apply. Falling back here keeps unit tests
// (and any environment where the public URL slipped through unset) working.
const siteUrl = () =>
  (env.NEXT_PUBLIC_SITE_URL || 'https://careerpilot.ae').replace(/\/$/, '')

// ─── Payment outcomes ──────────────────────────────────────────────────────

export interface PaymentApprovedVars {
  userName: string
  planName: string
  amountAED: string
  periodEndIso?: string | null
}

export function paymentApprovedEmail(v: PaymentApprovedVars): {
  subject: string
  html: string
  text: string
} {
  const subject = `Payment confirmed — ${v.planName}`
  const periodLine = v.periodEndIso
    ? `Your access is active until ${new Date(v.periodEndIso).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}.`
    : 'Your access is active now.'
  const html = layout({
    preheader: `Your CareerPilot ${v.planName} is active.`,
    heading: `Welcome to ${v.planName} 🎉`,
    bodyHtml: `<p>Hi ${escapeHtml(v.userName)},</p>
               <p>We've confirmed your payment of <strong>${escapeHtml(v.amountAED)} AED</strong> for the <strong>${escapeHtml(v.planName)}</strong>.</p>
               <p>${escapeHtml(periodLine)} Open the app to download your CV or generate a tailored version for your next role.</p>`,
    ctaLabel: 'Open CareerPilot',
    ctaUrl: `${siteUrl()}/dashboard`,
    footerNote: 'If you didn\'t make this purchase, reply to this email and we\'ll investigate.',
  })
  const text = plainText([
    `Hi ${v.userName},`,
    `We've confirmed your payment of ${v.amountAED} AED for ${v.planName}.`,
    periodLine,
    `${siteUrl()}/dashboard`,
  ])
  return { subject, html, text }
}

export interface PaymentRejectedVars {
  userName: string
  planName: string
  reason: string
}

export function paymentRejectedEmail(v: PaymentRejectedVars): {
  subject: string
  html: string
  text: string
} {
  const subject = `We couldn't confirm your payment — ${v.planName}`
  const html = layout({
    preheader: 'Action needed: payment confirmation',
    heading: 'Payment could not be confirmed',
    bodyHtml: `<p>Hi ${escapeHtml(v.userName)},</p>
               <p>We were unable to confirm your payment for the <strong>${escapeHtml(v.planName)}</strong>.</p>
               <p><strong>Reason:</strong> ${escapeHtml(v.reason)}</p>
               <p>If you've already paid, reply with proof of payment and we'll take another look.</p>`,
    ctaLabel: 'View payment status',
    ctaUrl: `${siteUrl()}/subscription`,
  })
  const text = plainText([
    `Hi ${v.userName},`,
    `We were unable to confirm your payment for ${v.planName}.`,
    `Reason: ${v.reason}`,
    `If you've already paid, reply with proof of payment.`,
    `${siteUrl()}/subscription`,
  ])
  return { subject, html, text }
}
