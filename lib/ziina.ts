/**
 * SUNSET — replaced in Phase 3 by lib/payments/ziina.ts.
 *
 * The new module implements HMAC signature verification, IP allowlisting,
 * idempotent operation_ids, and the documented Ziina v2 contract. The old
 * exports here would silently bypass those controls, so we throw if any
 * legacy caller still imports them.
 *
 * Migration map:
 *   createZiinaPayment   → use lib/payments/router.ts → createPayment({ method: 'ziina', ... })
 *   verifyZiinaPayment   → use lib/payments/ziina.ts → getZiinaIntent(id)
 *   verifyZiinaWebhook   → use lib/payments/ziina.ts → verifyZiinaSignature({ rawBody, signatureHeader })
 *   registerZiinaWebhook → register via the Ziina dashboard (one-time setup)
 */

const ERR =
  'lib/ziina.ts was retired in Phase 5. Import from lib/payments/{ziina,router,whatsapp} instead.'

export function createZiinaPayment(): never {
  throw new Error(ERR)
}
export function verifyZiinaPayment(): never {
  throw new Error(ERR)
}
export function verifyZiinaWebhook(): never {
  throw new Error(ERR)
}
export function registerZiinaWebhook(): never {
  throw new Error(ERR)
}
