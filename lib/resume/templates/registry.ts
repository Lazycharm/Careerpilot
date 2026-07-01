import type { HtmlTemplateMeta } from './types'
import { ClassicTemplate } from './classic/Template'
import { MinimalTemplate } from './minimal/Template'
import { ExecutiveTemplate } from './executive/Template'
import { ModernTemplate } from './modern/Template'

export type { HtmlTemplateMeta } from './types'

/**
 * defineTemplate — DSL helper that validates a template definition at build time.
 * Each template entry must be < 300 lines of component code.
 */
export function defineTemplate(meta: HtmlTemplateMeta): HtmlTemplateMeta {
  return meta
}

export const HTML_TEMPLATE_REGISTRY: Record<string, HtmlTemplateMeta> = {
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
    supportsPhoto: false,
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
}

export const DEFAULT_HTML_TEMPLATE_KEY = 'dubai-classic'

export function getHtmlTemplate(key: string | undefined | null): HtmlTemplateMeta {
  if (key && HTML_TEMPLATE_REGISTRY[key]) return HTML_TEMPLATE_REGISTRY[key]
  return HTML_TEMPLATE_REGISTRY[DEFAULT_HTML_TEMPLATE_KEY]
}

export function listHtmlTemplates(): HtmlTemplateMeta[] {
  return Object.values(HTML_TEMPLATE_REGISTRY)
}
