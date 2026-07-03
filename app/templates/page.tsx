'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, Lock, Sparkles, CheckCircle2, Camera } from 'lucide-react'
import { ResumePreview } from '@/components/resume/ResumePreview'
import { SAMPLE_RESUME_DATA } from '@/lib/resume/sampleData'

type TemplateEntry = {
  key: string
  name: string
  category: 'classic' | 'minimal' | 'executive' | 'modern' | 'creative' | 'premium' | 'specialty' | 'ats'
  description: string
  isPremium: boolean
  supportsPhoto: boolean
  atsScore: number
  tags: string[]
}

const ALL_TEMPLATES: TemplateEntry[] = [
  // ── Original 4 ──────────────────────────────────────────────────────────
  {
    key: 'dubai-classic',
    name: 'Dubai Classic',
    category: 'classic',
    description: 'Clean single-column navy accent. The standard for banking, consulting, and corporate UAE roles.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 99,
    tags: ['ATS-Safe', 'Finance', 'Corporate'],
  },
  {
    key: 'sharjah-minimal',
    name: 'Sharjah Minimal',
    category: 'minimal',
    description: 'Ultra-clean black and white. Zero distractions — just your content. Loved by tech professionals.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 100,
    tags: ['ATS-Safe', 'Tech', 'Design'],
  },
  {
    key: 'abu-dhabi-executive',
    name: 'Abu Dhabi Executive',
    category: 'executive',
    description: 'Elegant serif typography with burgundy accent. Built for senior leaders and C-suite roles.',
    isPremium: true,
    supportsPhoto: true,
    atsScore: 97,
    tags: ['Executive', 'Government', 'Finance'],
  },
  {
    key: 'gulf-modern',
    name: 'Gulf Modern',
    category: 'modern',
    description: 'Contemporary Poppins font with teal accents and grouped skill pills.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 96,
    tags: ['Modern', 'Marketing', 'Hospitality'],
  },

  // ── 15 UAE Industry Templates ────────────────────────────────────────────
  {
    key: 'uae-banking',
    name: 'UAE Banking',
    category: 'classic',
    description: 'Double-rule centered header, Inter font. The definitive format for DIFC and UAE banking roles.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 99,
    tags: ['Banking', 'Finance', 'Insurance'],
  },
  {
    key: 'uae-tech',
    name: 'UAE Tech',
    category: 'modern',
    description: 'Dark sidebar with JetBrains Mono labels and blue accent. Engineered for Dubai tech roles.',
    isPremium: false,
    supportsPhoto: true,
    atsScore: 94,
    tags: ['Software', 'Engineering', 'IT'],
  },
  {
    key: 'uae-hospitality',
    name: 'UAE Hospitality',
    category: 'creative',
    description: 'Amber gradient header with Playfair Display serif. Perfect for hotels, F&B, and tourism.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 92,
    tags: ['Hotels', 'Tourism', 'F&B'],
  },
  {
    key: 'uae-healthcare',
    name: 'UAE Healthcare',
    category: 'specialty',
    description: 'Teal header with left-border sections. Clean clinical layout for DHA and HAAD licensed roles.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 97,
    tags: ['Medical', 'Nursing', 'Pharmacy'],
  },
  {
    key: 'uae-government',
    name: 'UAE Government',
    category: 'classic',
    description: 'Formal navy with block section titles. Meets MOHRE and federal government formatting standards.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 99,
    tags: ['Government', 'Public Sector', 'Federal'],
  },
  {
    key: 'uae-creative',
    name: 'UAE Creative',
    category: 'creative',
    description: 'Violet gradient sidebar with pill skills and photo support. Stand out in creative industries.',
    isPremium: false,
    supportsPhoto: true,
    atsScore: 88,
    tags: ['Design', 'Media', 'Creative'],
  },
  {
    key: 'uae-marketing',
    name: 'UAE Marketing',
    category: 'modern',
    description: 'Purple-to-pink gradient header with categorized skill pills. Built for digital marketers.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 91,
    tags: ['Marketing', 'Digital', 'Brand'],
  },
  {
    key: 'uae-startup',
    name: 'UAE Startup',
    category: 'modern',
    description: 'Bold orange accent with triangle bullets. High-energy layout for startup and scale-up roles.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 93,
    tags: ['Startup', 'Product', 'Growth'],
  },
  {
    key: 'uae-photo-executive',
    name: 'UAE Photo Executive',
    category: 'premium',
    description: 'Cormorant Garamond serif with gold accent and centered photo. Luxury premium feel.',
    isPremium: true,
    supportsPhoto: true,
    atsScore: 90,
    tags: ['Executive', 'Premium', 'Finance'],
  },
  {
    key: 'uae-legal',
    name: 'UAE Legal',
    category: 'classic',
    description: 'Lora serif, conservative charcoal, double horizontal rule. Authoritative for legal roles.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 98,
    tags: ['Legal', 'Compliance', 'Corporate'],
  },
  {
    key: 'uae-retail',
    name: 'UAE Retail',
    category: 'modern',
    description: 'Emerald green header with Nunito font and pill skills. Energetic for UAE retail roles.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 95,
    tags: ['Retail', 'Sales', 'Customer Service'],
  },
  {
    key: 'uae-education',
    name: 'UAE Education',
    category: 'specialty',
    description: 'Source Serif 4 with academic blue. Teaching-focused layout for KHDA and MOE roles.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 97,
    tags: ['Teaching', 'Education', 'Academic'],
  },
  {
    key: 'uae-gold',
    name: 'UAE Gold',
    category: 'premium',
    description: 'Dark header with gold gradient rule and Cormorant Garamond. The ultimate premium template.',
    isPremium: true,
    supportsPhoto: false,
    atsScore: 89,
    tags: ['Premium', 'Luxury', 'Executive'],
  },
  {
    key: 'uae-photo-modern',
    name: 'UAE Photo Modern',
    category: 'modern',
    description: 'Teal header with top-right photo placement and Nunito Sans. Photo-ready modern layout.',
    isPremium: false,
    supportsPhoto: true,
    atsScore: 92,
    tags: ['Modern', 'Photo', 'Professional'],
  },
  {
    key: 'uae-desert',
    name: 'UAE Desert',
    category: 'premium',
    description: 'Warm terracotta gradient with diamond decorations and Playfair Display. Distinctly UAE.',
    isPremium: true,
    supportsPhoto: false,
    atsScore: 88,
    tags: ['Premium', 'Creative', 'Unique'],
  },

  // ── 5 ATS Templates ───────────────────────────────────────────────────────
  {
    key: 'ats-pure',
    name: 'ATS Pure',
    category: 'ats',
    description: '100% ATS-safe. Arial only, no colors, no columns, plain dividers. Maximum parser compatibility.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 100,
    tags: ['ATS-Safe', 'No Styling', 'Maximum Compat'],
  },
  {
    key: 'ats-professional',
    name: 'ATS Professional',
    category: 'ats',
    description: 'Calibri-style clean layout with double-rule header. Safe for all UAE ATS systems.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 100,
    tags: ['ATS-Safe', 'Professional', 'Clean'],
  },
  {
    key: 'ats-finance',
    name: 'ATS Finance',
    category: 'ats',
    description: 'Black section titles with plain layout. Built for UAE banking and DIFC ATS portals.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 100,
    tags: ['ATS-Safe', 'Banking', 'Finance'],
  },
  {
    key: 'ats-tech',
    name: 'ATS Tech',
    category: 'ats',
    description: 'Skills section first for keyword density. Optimized for LinkedIn Easy Apply and tech ATS.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 100,
    tags: ['ATS-Safe', 'Tech', 'Keywords'],
  },
  {
    key: 'ats-management',
    name: 'ATS Management',
    category: 'ats',
    description: 'Achievement-focused with uppercase section titles. For senior management ATS submissions.',
    isPremium: false,
    supportsPhoto: false,
    atsScore: 100,
    tags: ['ATS-Safe', 'Management', 'Senior'],
  },
]

type FilterKey = 'all' | 'ats' | 'classic' | 'minimal' | 'executive' | 'modern' | 'creative' | 'premium' | 'specialty'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'All Templates' },
  { key: 'ats',       label: 'ATS-Safe' },
  { key: 'classic',   label: 'Classic' },
  { key: 'modern',    label: 'Modern' },
  { key: 'creative',  label: 'Creative' },
  { key: 'premium',   label: 'Premium' },
  { key: 'specialty', label: 'Specialty' },
  { key: 'executive', label: 'Executive' },
  { key: 'minimal',   label: 'Minimal' },
]

function filterTemplates(templates: TemplateEntry[], filter: FilterKey): TemplateEntry[] {
  if (filter === 'all') return templates
  if (filter === 'ats') return templates.filter((t) => t.category === 'ats')
  return templates.filter((t) => t.category === filter)
}

export default function TemplatesPage() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const filtered = filterTemplates(ALL_TEMPLATES, filter)

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Career Pilot"
                width={140}
                height={45}
                className="h-8 sm:h-10 w-auto"
              />
            </Link>
            <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-sm min-h-[44px]">Log in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="text-sm min-h-[44px] gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Create Resume
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-6 gap-1 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            Resume Templates
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            {ALL_TEMPLATES.length} templates — ATS-optimized and built for the UAE market. Pick one, customize it with AI, download in minutes.
          </p>
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-gray-600">
          {['All templates pass ATS screening', 'UAE & GCC market ready', 'AI customizes your content'].map((text) => (
            <div key={text} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10">
          {FILTERS.map((f) => {
            const count = filterTemplates(ALL_TEMPLATES, f.key).length
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[40px]',
                  filter === f.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {f.label}
                <span className={cn('ml-1.5 text-xs', filter === f.key ? 'opacity-75' : 'opacity-60')}>
                  ({count})
                </span>
              </button>
            )
          })}
        </div>

        {/* Template grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No templates in this category yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filtered.map((template) => (
              <Link href="/auth/register" key={template.key} className="group block">
                <div className={cn(
                  'relative rounded-xl overflow-hidden border bg-white shadow-sm transition-all',
                  'group-hover:shadow-xl group-hover:-translate-y-1'
                )}>
                  {/* Badges */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-semibold text-green-700">
                      ATS {template.atsScore}%
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
                    {template.isPremium && (
                      <span className="flex items-center gap-0.5 rounded-full bg-yellow-100 px-2 py-0.5 text-[9px] font-semibold text-yellow-700">
                        <Lock className="h-2.5 w-2.5" />
                        Pro
                      </span>
                    )}
                    {template.supportsPhoto && (
                      <span className="flex items-center gap-0.5 rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-semibold text-blue-600">
                        <Camera className="h-2.5 w-2.5" />
                        Photo
                      </span>
                    )}
                  </div>

                  {/* Live preview */}
                  <div className="overflow-hidden border-b border-gray-100" style={{ height: '200px', pointerEvents: 'none' }}>
                    <ResumePreview
                      data={SAMPLE_RESUME_DATA}
                      templateKey={template.key}
                    />
                  </div>

                  {/* Card footer */}
                  <div className="px-3 py-3 bg-white">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                      {template.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[9px] font-medium bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-14 sm:mt-16 py-10 sm:py-12 px-6 sm:px-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl text-center border border-blue-100">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to land your next job?</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
            Pick any template, let AI write your content, download an ATS-optimized PDF — all in under 10 minutes.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="min-h-[48px] px-8 gap-2">
              <Sparkles className="h-5 w-5" />
              Build My Resume Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
