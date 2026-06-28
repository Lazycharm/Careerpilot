/**
 * PDF design tokens — shared by all React-PDF templates.
 *
 * Keep these conservative. ATS parsers prefer:
 * - Single column, top-to-bottom reading order (use Page → View column).
 * - Standard sans-serif fonts at 10-12pt body.
 * - Plenty of whitespace; line-height ≥ 1.3.
 * - Visible section headers (NOT just bold inline).
 * - No tables, no text-in-image, no decorative columns that interleave content.
 */

import type { Style } from '@react-pdf/types'

export type ThemeName = 'dubai-classic' | 'abu-dhabi-executive' | 'sharjah-minimal' | 'gulf-modern'

export interface Theme {
  name: ThemeName
  /** Body font family — must match a Font.register() call or a built-in. */
  fontBody: string
  /** Heading font family — can equal fontBody. */
  fontHeading: string
  /** RGB-hex without alpha. */
  colors: {
    text: string
    muted: string
    accent: string
    rule: string
    background: string
  }
  size: {
    name: number
    section: number
    subSection: number
    body: number
    small: number
  }
  spacing: {
    page: number // page padding (pt)
    section: number // gap between sections
    paragraph: number // gap inside sections
    bullet: number // gap between bullets
  }
  lineHeight: number
  /** Whether to allow a thin rule under section headers. */
  sectionRule: boolean
}

const BASE_SPACING = {
  page: 36, // 0.5"
  section: 14,
  paragraph: 6,
  bullet: 3,
}

export const THEMES: Record<ThemeName, Theme> = {
  'dubai-classic': {
    name: 'dubai-classic',
    fontBody: 'Helvetica',
    fontHeading: 'Helvetica-Bold',
    colors: {
      text: '#111827',
      muted: '#4b5563',
      accent: '#1e3a8a',
      rule: '#d1d5db',
      background: '#ffffff',
    },
    size: { name: 22, section: 12, subSection: 11, body: 10, small: 9 },
    spacing: BASE_SPACING,
    lineHeight: 1.4,
    sectionRule: true,
  },
  'abu-dhabi-executive': {
    name: 'abu-dhabi-executive',
    fontBody: 'Times-Roman',
    fontHeading: 'Times-Bold',
    colors: {
      text: '#0f172a',
      muted: '#475569',
      accent: '#7c2d12',
      rule: '#cbd5e1',
      background: '#ffffff',
    },
    size: { name: 24, section: 12, subSection: 11, body: 10.5, small: 9.5 },
    spacing: { ...BASE_SPACING, section: 16 },
    lineHeight: 1.45,
    sectionRule: true,
  },
  'sharjah-minimal': {
    name: 'sharjah-minimal',
    fontBody: 'Helvetica',
    fontHeading: 'Helvetica-Bold',
    colors: {
      text: '#0a0a0a',
      muted: '#525252',
      accent: '#0a0a0a',
      rule: '#e5e5e5',
      background: '#ffffff',
    },
    size: { name: 20, section: 11, subSection: 10.5, body: 10, small: 9 },
    spacing: { ...BASE_SPACING, section: 12, paragraph: 4 },
    lineHeight: 1.35,
    sectionRule: false,
  },
  'gulf-modern': {
    name: 'gulf-modern',
    fontBody: 'Helvetica',
    fontHeading: 'Helvetica-Bold',
    colors: {
      text: '#111827',
      muted: '#4b5563',
      accent: '#047857',
      rule: '#a7f3d0',
      background: '#ffffff',
    },
    size: { name: 22, section: 12, subSection: 11, body: 10, small: 9 },
    spacing: BASE_SPACING,
    lineHeight: 1.4,
    sectionRule: true,
  },
}

/** Build a reusable style sheet from a theme. Avoids reinventing per template. */
export function buildStyles(theme: Theme): Record<string, Style> {
  return {
    page: {
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontFamily: theme.fontBody,
      fontSize: theme.size.body,
      lineHeight: theme.lineHeight,
      padding: theme.spacing.page,
    },
    name: {
      fontFamily: theme.fontHeading,
      fontSize: theme.size.name,
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
      color: theme.colors.muted,
      fontSize: theme.size.small,
    },
    section: {
      marginTop: theme.spacing.section,
    },
    sectionTitle: {
      fontFamily: theme.fontHeading,
      fontSize: theme.size.section,
      color: theme.colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 4,
      paddingBottom: theme.sectionRule ? 2 : 0,
      borderBottomWidth: theme.sectionRule ? 0.6 : 0,
      borderBottomColor: theme.colors.rule,
    },
    role: {
      fontFamily: theme.fontHeading,
      fontSize: theme.size.subSection,
    },
    company: {
      color: theme.colors.muted,
      fontSize: theme.size.body,
    },
    dates: {
      color: theme.colors.muted,
      fontSize: theme.size.small,
    },
    paragraph: {
      marginTop: theme.spacing.paragraph,
    },
    bulletRow: {
      flexDirection: 'row',
      marginTop: theme.spacing.bullet,
    },
    bulletDot: {
      width: 9,
      color: theme.colors.muted,
    },
    bulletText: {
      flex: 1,
    },
    summaryText: {
      marginTop: 4,
    },
  }
}
