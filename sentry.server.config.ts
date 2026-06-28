/**
 * Sentry — server runtime config.
 * Loaded by instrumentation.ts only if SENTRY_DSN is set.
 */

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Don't ship PII; redact in beforeSend if needed.
    sendDefaultPii: false,
  })
}
