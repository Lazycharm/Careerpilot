import type { CLTemplateMeta } from './types'
import { ClassicCLTemplate } from './classic/Template'
import { MinimalCLTemplate } from './minimal/Template'
import { ExecutiveCLTemplate } from './executive/Template'
import { ModernCLTemplate } from './modern/Template'
import { EmiratesCLTemplate } from './emirates/Template'
import { CorporateCLTemplate } from './corporate/Template'
import { TechCLTemplate } from './tech/Template'
import { CreativeCLTemplate } from './creative/Template'
import { HealthcareCLTemplate } from './healthcare/Template'
import { BoldCLTemplate } from './bold/Template'
import { DesertCLTemplate } from './desert/Template'

export type { CLTemplateMeta } from './types'

export const CL_TEMPLATE_REGISTRY: Record<string, CLTemplateMeta> = {
  'classic': {
    key: 'classic',
    name: 'Dubai Classic',
    description: 'Navy blue accent, Inter font — professional and versatile',
    accentColor: '#1d4ed8',
    isPremium: false,
    component: ClassicCLTemplate,
  },
  'minimal': {
    key: 'minimal',
    name: 'Sharjah Minimal',
    description: 'Ultra-clean monochrome — lets your words speak',
    accentColor: '#0a0a0a',
    isPremium: false,
    component: MinimalCLTemplate,
  },
  'executive': {
    key: 'executive',
    name: 'Abu Dhabi Executive',
    description: 'Merriweather serif, burgundy — senior roles & leadership',
    accentColor: '#7c2d12',
    isPremium: false,
    component: ExecutiveCLTemplate,
  },
  'modern': {
    key: 'modern',
    name: 'Gulf Modern',
    description: 'Teal sidebar layout, Poppins — modern and dynamic',
    accentColor: '#0d9488',
    isPremium: false,
    component: ModernCLTemplate,
  },
  'emirates': {
    key: 'emirates',
    name: 'Emirates Pro',
    description: 'Dark header with gradient accent — bold first impression',
    accentColor: '#0f172a',
    isPremium: false,
    component: EmiratesCLTemplate,
  },
  'corporate': {
    key: 'corporate',
    name: 'DIFC Corporate',
    description: 'Double rule divider, ultra-formal — banking and finance',
    accentColor: '#374151',
    isPremium: false,
    component: CorporateCLTemplate,
  },
  'tech': {
    key: 'tech',
    name: 'Tech Dubai',
    description: 'Avatar initials, blue accent — tech and startups',
    accentColor: '#2563eb',
    isPremium: false,
    component: TechCLTemplate,
  },
  'creative': {
    key: 'creative',
    name: 'Creative Gulf',
    description: 'Violet gradient header — design, media, marketing',
    accentColor: '#7c3aed',
    isPremium: false,
    component: CreativeCLTemplate,
  },
  'healthcare': {
    key: 'healthcare',
    name: 'Healthcare UAE',
    description: 'Green left-border accent — healthcare and medical',
    accentColor: '#059669',
    isPremium: false,
    component: HealthcareCLTemplate,
  },
  'bold': {
    key: 'bold',
    name: 'Startup Bold',
    description: 'Orange accent, oversized name — startups and sales',
    accentColor: '#ea580c',
    isPremium: false,
    component: BoldCLTemplate,
  },
  'desert': {
    key: 'desert',
    name: 'Desert Gold',
    description: 'Gold divider, Merriweather serif, centered header — elegant',
    accentColor: '#d4a24e',
    isPremium: false,
    component: DesertCLTemplate,
  },
}

export const DEFAULT_CL_TEMPLATE_KEY = 'classic'

export function getCLTemplate(key: string | undefined | null): CLTemplateMeta {
  if (key && CL_TEMPLATE_REGISTRY[key]) return CL_TEMPLATE_REGISTRY[key]
  return CL_TEMPLATE_REGISTRY[DEFAULT_CL_TEMPLATE_KEY]
}

export function listCLTemplates(): CLTemplateMeta[] {
  return Object.values(CL_TEMPLATE_REGISTRY)
}
