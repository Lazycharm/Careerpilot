/**
 * UAE-specific keyword libraries used by ATS scoring.
 *
 * These libraries reflect what UAE recruiters and Gulf-region ATS systems
 * (Taleo, Workday, SuccessFactors, Oracle iRecruitment) commonly look for.
 * Curated, not LLM-generated — keep edits human-reviewed.
 */

/** Generic UAE hiring keywords applicable across roles. */
export const UAE_GENERAL_KEYWORDS = [
  // Region / market context
  'UAE',
  'United Arab Emirates',
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'GCC',
  'Gulf',
  'MENA',
  // Visa / status
  'visa status',
  'residence visa',
  'employment visa',
  'transferable visa',
  'sponsorship',
  // Languages
  'Arabic',
  'English',
  'bilingual',
  // Work culture
  'cross-cultural',
  'multicultural',
  'multinational',
  'multi-cultural environment',
  // Compliance
  'Emiratization',
  'WPS',
  'MOHRE',
  'DIFC',
  'ADGM',
  'VAT',
  'IFRS',
]

/** Skills/keywords by industry. Lower-cased lookup. */
export const UAE_INDUSTRY_KEYWORDS: Record<string, string[]> = {
  banking: [
    'KYC',
    'AML',
    'Basel III',
    'IFRS',
    'credit risk',
    'compliance',
    'CBUAE',
    'retail banking',
    'corporate banking',
    'wealth management',
    'CFA',
  ],
  finance: [
    'financial modelling',
    'IFRS',
    'consolidation',
    'VAT',
    'audit',
    'CMA',
    'CPA',
    'ACCA',
    'budgeting',
    'forecasting',
    'P&L',
  ],
  tech: [
    'AWS',
    'Azure',
    'CI/CD',
    'TypeScript',
    'React',
    'Node.js',
    'microservices',
    'Kubernetes',
    'PostgreSQL',
    'agile',
    'scrum',
  ],
  hospitality: [
    'Opera PMS',
    'guest experience',
    'F&B',
    'banquet',
    'concierge',
    'Forbes 5-star',
    'luxury service',
    'occupancy',
    'RevPAR',
  ],
  construction: [
    'FIDIC',
    'BOQ',
    'tendering',
    'cost control',
    'project planning',
    'AutoCAD',
    'Primavera P6',
    'HSE',
    'site supervision',
    'MEP',
  ],
  healthcare: [
    'DHA',
    'HAAD',
    'MOH',
    'EMR',
    'JCI accreditation',
    'patient care',
    'clinical governance',
    'infection control',
  ],
  retail: [
    'POS',
    'merchandising',
    'visual display',
    'inventory',
    'shrinkage',
    'KPI',
    'sales conversion',
    'CRM',
    'GMV',
  ],
  logistics: [
    'freight forwarding',
    'customs clearance',
    'Jebel Ali',
    'DP World',
    'air cargo',
    'last-mile',
    'WMS',
    'SAP',
  ],
  marketing: [
    'SEO',
    'SEM',
    'Google Ads',
    'Meta Ads',
    'content strategy',
    'performance marketing',
    'CRM',
    'brand strategy',
    'attribution',
  ],
  education: [
    'KHDA',
    'ADEK',
    'curriculum',
    'IB',
    'British curriculum',
    'American curriculum',
    'student outcomes',
    'pedagogy',
  ],
}

/** Generic strong action verbs preferred by recruiters. */
export const STRONG_ACTION_VERBS = [
  'led',
  'launched',
  'delivered',
  'reduced',
  'increased',
  'built',
  'designed',
  'implemented',
  'negotiated',
  'closed',
  'scaled',
  'optimized',
  'streamlined',
  'restructured',
  'recovered',
  'mentored',
  'owned',
  'shipped',
  'piloted',
  'turned around',
]

/** Weak / overused phrases recruiters dislike. */
export const WEAK_PHRASES = [
  'responsible for',
  'duties included',
  'team player',
  'hard worker',
  'go-getter',
  'detail oriented',
  'results driven',
  'self-motivated',
  'think outside the box',
  'synergy',
  'leverage',
  'go-to person',
]

/** AI clichés that mark generated content. */
export const AI_TELLS = [
  'in today’s fast-paced',
  'in today\'s fast-paced',
  'leveraged my expertise',
  'demonstrated proficiency',
  'spearheaded initiatives',
  'cross-functional synergy',
  'dynamic environment',
  'paradigm shift',
  'a proven track record of delivering results',
]
