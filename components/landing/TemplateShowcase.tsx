'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Lock } from 'lucide-react'
import { ResumePreview } from '@/components/resume/ResumePreview'
import { SAMPLE_RESUME_DATA } from '@/lib/resume/sampleData'

const SHOWCASE_TEMPLATES = [
  { key: 'dubai-classic',       name: 'Dubai Classic',       category: 'Classic',   isPremium: false },
  { key: 'sharjah-minimal',     name: 'Sharjah Minimal',     category: 'Minimal',   isPremium: false },
  { key: 'abu-dhabi-executive', name: 'Abu Dhabi Executive', category: 'Executive', isPremium: true  },
  { key: 'gulf-modern',         name: 'Gulf Modern',         category: 'Modern',    isPremium: false },
]

export function TemplateShowcase() {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Professional templates that get you hired
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every template is ATS-optimized and designed for the UAE market. Pick one and customize it in minutes.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8">
          {SHOWCASE_TEMPLATES.map((t) => (
            <Link href="/auth/register" key={t.key} className="group block">
              <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
                {t.isPremium && (
                  <span className="absolute top-2 right-2 z-10 flex items-center gap-0.5 rounded-full bg-yellow-100 px-2 py-0.5 text-[9px] font-semibold text-yellow-700">
                    <Lock className="h-2.5 w-2.5" />
                    Pro
                  </span>
                )}
                {/* Live template preview clipped to show header + first section */}
                <div className="overflow-hidden" style={{ height: '180px', pointerEvents: 'none' }}>
                  <ResumePreview
                    data={SAMPLE_RESUME_DATA}
                    templateKey={t.key}
                  />
                </div>
                <div className="px-3 py-2 border-t border-gray-100 bg-white">
                  <p className="text-xs font-semibold text-gray-800 group-hover:text-primary transition-colors truncate">
                    {t.name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{t.category}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/templates">
            <Button variant="outline" size="lg" className="min-h-[48px] gap-2">
              View All Templates
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
