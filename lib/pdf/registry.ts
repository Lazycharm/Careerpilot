/**
 * Template registry.
 *
 * Source of truth mapping template keys → React-PDF components and metadata.
 * `Template.pdfReactKey` in the database refers to a key in this map.
 * Adding a new template = adding one entry here.
 */

import type React from 'react'
import { Template01_DubaiClassic } from './templates/Template01_DubaiClassic'
import { Template02_AbuDhabiExecutive } from './templates/Template02_AbuDhabiExecutive'
import { Template03_SharjahMinimal } from './templates/Template03_SharjahMinimal'
import { Template04_GulfModern } from './templates/Template04_GulfModern'
import type { ResumeData } from '@/types'

export interface TemplateMeta {
  key: string
  name: string
  category: 'classic' | 'executive' | 'minimal' | 'modern'
  industries: string[] // empty = general
  language: 'en' | 'ar'
  isPremium: boolean
  component: React.ComponentType<{ data: ResumeData }>
}

export const TEMPLATE_REGISTRY: Record<string, TemplateMeta> = {
  'dubai-classic': {
    key: 'dubai-classic',
    name: 'Dubai Classic',
    category: 'classic',
    industries: ['banking', 'consulting', 'corporate'],
    language: 'en',
    isPremium: false,
    component: Template01_DubaiClassic,
  },
  'abu-dhabi-executive': {
    key: 'abu-dhabi-executive',
    name: 'Abu Dhabi Executive',
    category: 'executive',
    industries: ['energy', 'government', 'finance', 'legal'],
    language: 'en',
    isPremium: true,
    component: Template02_AbuDhabiExecutive,
  },
  'sharjah-minimal': {
    key: 'sharjah-minimal',
    name: 'Sharjah Minimal',
    category: 'minimal',
    industries: ['tech', 'design', 'startup'],
    language: 'en',
    isPremium: false,
    component: Template03_SharjahMinimal,
  },
  'gulf-modern': {
    key: 'gulf-modern',
    name: 'Gulf Modern',
    category: 'modern',
    industries: ['hospitality', 'retail', 'marketing'],
    language: 'en',
    isPremium: false,
    component: Template04_GulfModern,
  },
}

export const DEFAULT_TEMPLATE_KEY = 'dubai-classic'

export function getTemplate(key: string | undefined | null): TemplateMeta {
  if (key && TEMPLATE_REGISTRY[key]) return TEMPLATE_REGISTRY[key]
  return TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_KEY]
}

export function listTemplates(): TemplateMeta[] {
  return Object.values(TEMPLATE_REGISTRY)
}
