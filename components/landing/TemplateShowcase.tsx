'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const templates = [
  { key: 'modernProfessional', name: 'Modern Professional', category: 'Modern', colors: ['#667eea', '#764ba2'] },
  { key: 'minimalistTemplate', name: 'Minimalist', category: 'Classic', colors: ['#333333', '#666666'] },
  { key: 'oceanBlue', name: 'Ocean Blue', category: 'Modern', colors: ['#0077b6', '#00b4d8'] },
  { key: 'executiveTemplate', name: 'Executive', category: 'Premium', colors: ['#1a1a2e', '#16213e'], premium: true },
  { key: 'tealModern', name: 'Teal Modern', category: 'Modern', colors: ['#0d9488', '#14b8a6'] },
  { key: 'navyProfessional', name: 'Navy Professional', category: 'Classic', colors: ['#1e3a5f', '#2563eb'] },
]

function TemplateMiniPreview({ name, colors, premium }: { name: string; colors: string[]; premium?: boolean }) {
  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
      {premium && (
        <span className="absolute top-3 right-3 z-10 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-800">
          Premium
        </span>
      )}
      <div className="aspect-[8.5/11] w-full rounded bg-white border border-gray-100 overflow-hidden">
        {/* Mini resume skeleton */}
        <div className="h-full flex flex-col p-3">
          <div className="rounded-sm mb-2 p-2" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
            <div className="h-2 w-3/4 rounded bg-white/80 mb-1" />
            <div className="h-1 w-1/2 rounded bg-white/50" />
          </div>
          <div className="space-y-2 flex-1">
            <div>
              <div className="h-1.5 w-1/3 rounded mb-1" style={{ backgroundColor: colors[0] }} />
              <div className="h-1 w-full rounded bg-gray-200" />
              <div className="h-1 w-4/5 rounded bg-gray-100 mt-0.5" />
            </div>
            <div>
              <div className="h-1.5 w-2/5 rounded mb-1" style={{ backgroundColor: colors[0] }} />
              <div className="h-1 w-full rounded bg-gray-200" />
              <div className="h-1 w-3/4 rounded bg-gray-100 mt-0.5" />
              <div className="h-1 w-5/6 rounded bg-gray-100 mt-0.5" />
            </div>
            <div>
              <div className="h-1.5 w-1/4 rounded mb-1" style={{ backgroundColor: colors[0] }} />
              <div className="flex gap-1 flex-wrap">
                <div className="h-1 w-10 rounded bg-gray-200" />
                <div className="h-1 w-8 rounded bg-gray-200" />
                <div className="h-1 w-12 rounded bg-gray-200" />
                <div className="h-1 w-6 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-medium text-gray-700 group-hover:text-primary transition-colors">
        {name}
      </p>
    </div>
  )
}

export function TemplateShowcase() {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Professional templates that get you hired
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every template is ATS-optimized and designed by hiring experts. Pick one and customize it in minutes.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8">
          {templates.map((t) => (
            <Link href="/auth/register" key={t.key}>
              <TemplateMiniPreview name={t.name} colors={t.colors} premium={t.premium} />
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/templates">
            <Button variant="outline" size="lg" className="min-h-[48px] gap-2">
              View All 16 Templates
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
