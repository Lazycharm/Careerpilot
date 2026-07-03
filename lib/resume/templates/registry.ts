import type { HtmlTemplateMeta } from './types'
import { ClassicTemplate } from './classic/Template'
import { MinimalTemplate } from './minimal/Template'
import { ExecutiveTemplate } from './executive/Template'
import { ModernTemplate } from './modern/Template'
import { UAEBankingTemplate } from './uae-banking/Template'
import { UAETechTemplate } from './uae-tech/Template'
import { UAEHospitalityTemplate } from './uae-hospitality/Template'
import { UAEHealthcareTemplate } from './uae-healthcare/Template'
import { UAEGovernmentTemplate } from './uae-government/Template'
import { UAECreativeTemplate } from './uae-creative/Template'
import { UAEMarketingTemplate } from './uae-marketing/Template'
import { UAEStartupTemplate } from './uae-startup/Template'
import { UAEPhotoExecutiveTemplate } from './uae-photo-executive/Template'
import { UAELegalTemplate } from './uae-legal/Template'
import { UAERetailTemplate } from './uae-retail/Template'
import { UAEEducationTemplate } from './uae-education/Template'
import { UAEGoldTemplate } from './uae-gold/Template'
import { UAEPhotoModernTemplate } from './uae-photo-modern/Template'
import { UAEDesertTemplate } from './uae-desert/Template'
import { ATSPureTemplate } from './ats-pure/Template'
import { ATSProfessionalTemplate } from './ats-professional/Template'
import { ATSFinanceTemplate } from './ats-finance/Template'
import { ATSTechTemplate } from './ats-tech/Template'
import { ATSManagementTemplate } from './ats-management/Template'

export type { HtmlTemplateMeta } from './types'

export function defineTemplate(meta: HtmlTemplateMeta): HtmlTemplateMeta {
  return meta
}

export const HTML_TEMPLATE_REGISTRY: Record<string, HtmlTemplateMeta> = {
  // ── Original 4 ────────────────────────────────────────────────────────────
  'dubai-classic': defineTemplate({
    key: 'dubai-classic',
    name: 'Dubai Classic',
    category: 'classic',
    industries: ['banking', 'consulting', 'corporate'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#1e3a8a',
    component: ClassicTemplate,
  }),
  'sharjah-minimal': defineTemplate({
    key: 'sharjah-minimal',
    name: 'Sharjah Minimal',
    category: 'minimal',
    industries: ['tech', 'design', 'startup'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#0a0a0a',
    component: MinimalTemplate,
  }),
  'abu-dhabi-executive': defineTemplate({
    key: 'abu-dhabi-executive',
    name: 'Abu Dhabi Executive',
    category: 'executive',
    industries: ['energy', 'government', 'finance', 'legal'],
    isPremium: true,
    supportsPhoto: true,
    accentColor: '#7c2d12',
    component: ExecutiveTemplate,
  }),
  'gulf-modern': defineTemplate({
    key: 'gulf-modern',
    name: 'Gulf Modern',
    category: 'modern',
    industries: ['hospitality', 'retail', 'marketing'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#047857',
    component: ModernTemplate,
  }),

  // ── 15 UAE Standard Templates ─────────────────────────────────────────────
  'uae-banking': defineTemplate({
    key: 'uae-banking',
    name: 'UAE Banking',
    category: 'classic',
    industries: ['banking', 'finance', 'insurance', 'consulting'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#1e3a5f',
    component: UAEBankingTemplate,
  }),
  'uae-tech': defineTemplate({
    key: 'uae-tech',
    name: 'UAE Tech',
    category: 'modern',
    industries: ['software', 'IT', 'engineering', 'startup'],
    isPremium: false,
    supportsPhoto: true,
    accentColor: '#2563eb',
    component: UAETechTemplate,
  }),
  'uae-hospitality': defineTemplate({
    key: 'uae-hospitality',
    name: 'UAE Hospitality',
    category: 'creative',
    industries: ['hospitality', 'tourism', 'food-beverage', 'luxury-retail'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#92400e',
    component: UAEHospitalityTemplate,
  }),
  'uae-healthcare': defineTemplate({
    key: 'uae-healthcare',
    name: 'UAE Healthcare',
    category: 'specialty',
    industries: ['healthcare', 'medical', 'pharmacy', 'dentistry'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#0f766e',
    component: UAEHealthcareTemplate,
  }),
  'uae-government': defineTemplate({
    key: 'uae-government',
    name: 'UAE Government',
    category: 'classic',
    industries: ['government', 'public-sector', 'semi-government', 'defense'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#1e3a5f',
    component: UAEGovernmentTemplate,
  }),
  'uae-creative': defineTemplate({
    key: 'uae-creative',
    name: 'UAE Creative',
    category: 'creative',
    industries: ['design', 'advertising', 'creative-agency', 'art-direction'],
    isPremium: false,
    supportsPhoto: true,
    accentColor: '#7c3aed',
    component: UAECreativeTemplate,
  }),
  'uae-marketing': defineTemplate({
    key: 'uae-marketing',
    name: 'UAE Marketing',
    category: 'modern',
    industries: ['marketing', 'digital', 'PR', 'brand-management'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#7c3aed',
    component: UAEMarketingTemplate,
  }),
  'uae-startup': defineTemplate({
    key: 'uae-startup',
    name: 'UAE Startup',
    category: 'modern',
    industries: ['startup', 'entrepreneur', 'sales', 'business-dev'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#ea580c',
    component: UAEStartupTemplate,
  }),
  'uae-photo-executive': defineTemplate({
    key: 'uae-photo-executive',
    name: 'UAE Executive Photo',
    category: 'premium',
    industries: ['c-suite', 'VP', 'senior-management', 'board'],
    isPremium: true,
    supportsPhoto: true,
    accentColor: '#b45309',
    component: UAEPhotoExecutiveTemplate,
  }),
  'uae-legal': defineTemplate({
    key: 'uae-legal',
    name: 'UAE Legal',
    category: 'classic',
    industries: ['legal', 'compliance', 'judiciary', 'paralegal'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#1c1917',
    component: UAELegalTemplate,
  }),
  'uae-retail': defineTemplate({
    key: 'uae-retail',
    name: 'UAE Retail',
    category: 'modern',
    industries: ['retail', 'sales', 'customer-service', 'FMCG'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#059669',
    component: UAERetailTemplate,
  }),
  'uae-education': defineTemplate({
    key: 'uae-education',
    name: 'UAE Education',
    category: 'specialty',
    industries: ['education', 'academic', 'training', 'research'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#1e40af',
    component: UAEEducationTemplate,
  }),
  'uae-gold': defineTemplate({
    key: 'uae-gold',
    name: 'UAE Gold Premium',
    category: 'premium',
    industries: ['luxury-retail', 'hospitality-management', 'real-estate', 'finance'],
    isPremium: true,
    supportsPhoto: false,
    accentColor: '#92400e',
    component: UAEGoldTemplate,
  }),
  'uae-photo-modern': defineTemplate({
    key: 'uae-photo-modern',
    name: 'UAE Photo Modern',
    category: 'modern',
    industries: ['management', 'business-dev', 'consulting', 'sales'],
    isPremium: false,
    supportsPhoto: true,
    accentColor: '#0e7490',
    component: UAEPhotoModernTemplate,
  }),
  'uae-desert': defineTemplate({
    key: 'uae-desert',
    name: 'UAE Desert Dunes',
    category: 'premium',
    industries: ['real-estate', 'luxury', 'senior-management', 'consulting'],
    isPremium: true,
    supportsPhoto: false,
    accentColor: '#92400e',
    component: UAEDesertTemplate,
  }),

  // ── 5 ATS-Optimized Templates (UAE) ──────────────────────────────────────
  'ats-pure': defineTemplate({
    key: 'ats-pure',
    name: 'ATS Pure',
    category: 'ats',
    industries: ['any'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#000000',
    component: ATSPureTemplate,
  }),
  'ats-professional': defineTemplate({
    key: 'ats-professional',
    name: 'ATS Professional',
    category: 'ats',
    industries: ['general', 'corporate', 'admin'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#1a1a1a',
    component: ATSProfessionalTemplate,
  }),
  'ats-finance': defineTemplate({
    key: 'ats-finance',
    name: 'ATS Finance',
    category: 'ats',
    industries: ['banking', 'finance', 'accounting', 'insurance'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#000000',
    component: ATSFinanceTemplate,
  }),
  'ats-tech': defineTemplate({
    key: 'ats-tech',
    name: 'ATS Tech',
    category: 'ats',
    industries: ['software', 'IT', 'data', 'engineering'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#000000',
    component: ATSTechTemplate,
  }),
  'ats-management': defineTemplate({
    key: 'ats-management',
    name: 'ATS Management',
    category: 'ats',
    industries: ['management', 'director', 'executive', 'operations'],
    isPremium: false,
    supportsPhoto: false,
    accentColor: '#000000',
    component: ATSManagementTemplate,
  }),
}

export const DEFAULT_HTML_TEMPLATE_KEY = 'dubai-classic'

export function getHtmlTemplate(key: string | undefined | null): HtmlTemplateMeta {
  if (key && HTML_TEMPLATE_REGISTRY[key]) return HTML_TEMPLATE_REGISTRY[key]
  return HTML_TEMPLATE_REGISTRY[DEFAULT_HTML_TEMPLATE_KEY]
}

export function listHtmlTemplates(): HtmlTemplateMeta[] {
  return Object.values(HTML_TEMPLATE_REGISTRY)
}
