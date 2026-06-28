/**
 * Font registration for React-PDF.
 *
 * Phase 1 deliberately uses the built-in PDF base fonts (Helvetica, Times-Roman,
 * Courier) for the four English templates. These render identically on every
 * device, embed nothing, and keep file sizes small — perfect for ATS.
 *
 * For Arabic / RTL we register Noto Sans Arabic from the Google Fonts static
 * CDN. React-PDF can fetch fonts over HTTPS at render time. We cache the
 * registration so we only fetch once per process.
 *
 * Add custom display fonts here in Phase 2 if a designer-led template needs one.
 */

import { Font } from '@react-pdf/renderer'

let arabicRegistered = false

const NOTO_ARABIC = {
  regular:
    'https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyGyvu3CBFQLaig.ttf',
  bold: 'https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfaG2vu3CBFQLaig.ttf',
}

/** Idempotent. Call before rendering an Arabic resume. */
export function ensureArabicFontsRegistered() {
  if (arabicRegistered) return
  Font.register({
    family: 'NotoSansArabic',
    fonts: [
      { src: NOTO_ARABIC.regular, fontWeight: 'normal' },
      { src: NOTO_ARABIC.bold, fontWeight: 'bold' },
    ],
  })
  // Prevent ugly hyphenation breaks mid-word in Arabic and English alike.
  Font.registerHyphenationCallback((word) => [word])
  arabicRegistered = true
}

/** Pick the right body/heading font names for a language. */
export function pickFontFamily(language: 'en' | 'ar') {
  if (language === 'ar') {
    ensureArabicFontsRegistered()
    return { body: 'NotoSansArabic', heading: 'NotoSansArabic' }
  }
  return { body: 'Helvetica', heading: 'Helvetica-Bold' }
}
