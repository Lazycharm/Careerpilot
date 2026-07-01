'use client'

import { ScrollReveal } from './ScrollReveal'

const COMPANIES = [
  'Emirates',
  'ADNOC',
  'Noon',
  'Careem',
  'Majid Al Futtaim',
  'Etisalat',
  'Dubai Holding',
  'Emaar',
]

export function SocialProofBand() {
  return (
    <section className="border-y border-gray-100 bg-gray-50/50 py-8 sm:py-10 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
            Professionals from leading UAE companies trust Career Pilot
          </p>
        </ScrollReveal>

        {/* Infinite scroll ticker */}
        <div className="relative">
          <div className="flex gap-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <div className="flex gap-10 animate-marquee whitespace-nowrap flex-shrink-0">
              {[...COMPANIES, ...COMPANIES].map((company, i) => (
                <span
                  key={i}
                  className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors cursor-default"
                >
                  {company}
                </span>
              ))}
            </div>
            <div className="flex gap-10 animate-marquee whitespace-nowrap flex-shrink-0" aria-hidden>
              {[...COMPANIES, ...COMPANIES].map((company, i) => (
                <span
                  key={i}
                  className="text-sm font-semibold text-gray-400"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
