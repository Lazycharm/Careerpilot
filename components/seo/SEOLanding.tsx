/**
 * Shared layout for programmatic SEO landing pages.
 *
 * Renders the H1, body paragraphs, featured-template cards, FAQ accordion,
 * and CTAs in a consistent shape so all of /resume-templates/*, /cv-for/*,
 * /jobs/*, /companies/* feel like one product surface — and so the JSON-LD
 * we emit can be generated from a single helper.
 */

import Link from 'next/link'
import { getTemplate } from '@/lib/pdf/registry'

export interface SEOLandingProps {
  /** Visible H1. */
  heading: string
  /** Optional kicker above the H1 ("Banking · UAE"). */
  kicker?: string
  /** Lede / intro sentence rendered below the H1. */
  intro?: string
  /** Body paragraphs. */
  bodyParagraphs: string[]
  /** Featured CV templates by registry key. */
  featuredTemplateKeys?: string[]
  /** FAQ entries. */
  faqs?: Array<{ q: string; a: string }>
  /** Optional related-links module. */
  relatedLinks?: Array<{ href: string; label: string }>
}

export function SEOLanding(props: SEOLandingProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {props.kicker && (
          <p className="text-sm font-medium text-blue-700 mb-3 uppercase tracking-wide">
            {props.kicker}
          </p>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{props.heading}</h1>
        {props.intro && (
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">{props.intro}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-blue-700 text-white font-medium hover:bg-blue-800"
          >
            Build my CV free
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-gray-300 text-gray-800 font-medium hover:bg-gray-50"
          >
            See all templates
          </Link>
        </div>

        <article className="prose prose-gray max-w-none">
          {props.bodyParagraphs.map((p, i) => (
            <p key={i} className="text-gray-800 leading-relaxed mb-4">
              {p}
            </p>
          ))}
        </article>

        {props.featuredTemplateKeys && props.featuredTemplateKeys.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Recommended templates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {props.featuredTemplateKeys.map((k) => {
                const t = getTemplate(k)
                return (
                  <Link
                    key={k}
                    href={`/products?focus=${encodeURIComponent(k)}`}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition"
                  >
                    <div className="text-sm text-gray-500 uppercase tracking-wide">
                      {t.category}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {t.name}
                      {t.isPremium ? (
                        <span className="ml-2 text-xs uppercase text-amber-700">
                          Premium
                        </span>
                      ) : null}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Best for {t.industries.length ? t.industries.join(', ') : 'general use'}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {props.faqs && props.faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
            <div className="divide-y divide-gray-200">
              {props.faqs.map((f, i) => (
                <details
                  key={i}
                  className="py-4 group"
                  open={i === 0}
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
                    <span className="text-base font-medium text-gray-900">{f.q}</span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">
                      ▾
                    </span>
                  </summary>
                  <p className="mt-3 text-gray-700 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {props.relatedLinks && props.relatedLinks.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Related</h2>
            <ul className="flex flex-wrap gap-2">
              {props.relatedLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-800 hover:bg-gray-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-16 p-6 rounded-lg bg-blue-50 border border-blue-100">
          <h2 className="text-xl font-semibold mb-2">Ready to apply?</h2>
          <p className="text-gray-700 mb-4">
            Build an ATS-safe CV in minutes. Free templates, paid tailored
            versions for specific UAE employers.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-blue-700 text-white font-medium hover:bg-blue-800"
          >
            Start free
          </Link>
        </div>
      </div>
    </div>
  )
}
