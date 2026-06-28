/**
 * SEO data integrity tests.
 *
 * These guard the curated catalogue against silent regressions — once an
 * industry/role/city slug ships, changing it breaks search indexing.
 */

import { describe, expect, it } from 'vitest'
import {
  CITIES,
  INDUSTRIES,
  ROLES,
  findCity,
  findIndustry,
  findRole,
} from '@/lib/seo/data'
import { TEMPLATE_REGISTRY } from '@/lib/pdf/registry'

describe('SEO data catalogue', () => {
  it('every industry has a unique kebab-case slug', () => {
    const slugs = INDUSTRIES.map((i) => i.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/)
  })

  it('every role has a unique slug', () => {
    const slugs = ROLES.map((r) => r.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every city has a unique slug', () => {
    const slugs = CITIES.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('meta descriptions stay under 200 chars (Google snippet ceiling)', () => {
    for (const i of INDUSTRIES) expect(i.metaDescription.length).toBeLessThanOrEqual(200)
    for (const r of ROLES) expect(r.metaDescription.length).toBeLessThanOrEqual(200)
    for (const c of CITIES) expect(c.metaDescription.length).toBeLessThanOrEqual(200)
  })

  it('every featured templateKey resolves to a real registry entry', () => {
    const known = new Set(Object.keys(TEMPLATE_REGISTRY))
    for (const i of INDUSTRIES) {
      for (const k of i.templateKeys) expect(known.has(k)).toBe(true)
    }
    for (const r of ROLES) {
      for (const k of r.templateKeys) expect(known.has(k)).toBe(true)
    }
  })

  it('every role.industry resolves to a real industry slug', () => {
    const industries = new Set(INDUSTRIES.map((i) => i.slug))
    for (const r of ROLES) {
      expect(industries.has(r.industry)).toBe(true)
    }
  })

  it('every city.industries entry resolves to a real industry slug', () => {
    const industries = new Set(INDUSTRIES.map((i) => i.slug))
    for (const c of CITIES) {
      for (const ind of c.industries) {
        expect(industries.has(ind)).toBe(true)
      }
    }
  })

  it('find* helpers return the matching record', () => {
    expect(findIndustry('tech')?.name).toBe('Technology')
    expect(findRole('software-engineer')?.title).toBe('Software Engineer')
    expect(findCity('dubai')?.name).toBe('Dubai')
  })

  it('find* helpers return null on unknown slug', () => {
    expect(findIndustry('xxx')).toBeNull()
    expect(findRole('xxx')).toBeNull()
    expect(findCity('xxx')).toBeNull()
  })
})
