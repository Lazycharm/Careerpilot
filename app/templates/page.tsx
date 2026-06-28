'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { TemplateMiniPreview } from '@/components/resume/TemplateMiniPreview'
import { cn } from '@/lib/utils'
import { ArrowLeft, Sparkles } from 'lucide-react'

const allTemplates = [
  { key: 'modern-professional', name: 'Modern Professional', category: 'modern', description: 'Clean, contemporary design perfect for tech and creative industries', supportsPhoto: true, isPremium: false },
  { key: 'classic-traditional', name: 'Classic Traditional', category: 'classic', description: 'Timeless design ideal for finance, law, and corporate roles', supportsPhoto: false, isPremium: false },
  { key: 'creative-design', name: 'Creative Design', category: 'creative', description: 'Bold design perfect for designers, artists, and marketing professionals', supportsPhoto: true, isPremium: false },
  { key: 'timeline', name: 'Timeline', category: 'modern', description: 'Chronological layout that tells your career story', supportsPhoto: true, isPremium: true },
  { key: 'minimalist', name: 'Minimalist', category: 'classic', description: 'Ultra-clean design optimized for ATS systems', supportsPhoto: false, isPremium: false },
  { key: 'executive', name: 'Executive', category: 'premium', description: 'Sophisticated design for senior executives and C-level positions', supportsPhoto: true, isPremium: true },
  { key: 'ocean-blue', name: 'Ocean Blue', category: 'modern', description: 'Fresh blue gradient design perfect for tech and finance', supportsPhoto: true, isPremium: false },
  { key: 'forest-green', name: 'Forest Green', category: 'classic', description: 'Natural green design ideal for environmental and healthcare roles', supportsPhoto: false, isPremium: false },
  { key: 'sunset-orange', name: 'Sunset Orange', category: 'creative', description: 'Warm orange gradient perfect for creative and marketing roles', supportsPhoto: true, isPremium: false },
  { key: 'royal-purple', name: 'Royal Purple', category: 'premium', description: 'Elegant purple design for executive and leadership roles', supportsPhoto: true, isPremium: true },
  { key: 'midnight-dark', name: 'Midnight Dark', category: 'modern', description: 'Sophisticated dark theme perfect for tech and design roles', supportsPhoto: false, isPremium: true },
  { key: 'coral-pink', name: 'Coral Pink', category: 'creative', description: 'Soft pink design ideal for creative and design professionals', supportsPhoto: true, isPremium: false },
  { key: 'teal-modern', name: 'Teal Modern', category: 'modern', description: 'Fresh teal design perfect for healthcare and consulting', supportsPhoto: true, isPremium: false },
  { key: 'gold-elegant', name: 'Gold Elegant', category: 'premium', description: 'Luxurious gold design for executive and finance roles', supportsPhoto: true, isPremium: true },
  { key: 'navy-professional', name: 'Navy Professional', category: 'classic', description: 'Classic navy design ideal for corporate and legal roles', supportsPhoto: false, isPremium: false },
  { key: 'emerald-classic', name: 'Emerald Classic', category: 'classic', description: 'Rich emerald design perfect for finance and consulting', supportsPhoto: false, isPremium: false },
]

const categories = ['All', 'Modern', 'Classic', 'Creative', 'Premium']

export default function TemplatesPage() {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All'
    ? allTemplates
    : allTemplates.filter(t => t.category === filter.toLowerCase())

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
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-sm min-h-[44px]">Log in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="text-sm min-h-[44px] gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Create My Resume
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-6 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Professional Resume Templates
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every template is ATS-optimized and recruiter-approved. Pick one, customize it, and download your resume in minutes.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[40px]',
                filter === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-1.5 text-xs opacity-75">
                  ({allTemplates.filter(t => t.category === cat.toLowerCase()).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((template) => (
            <Link href="/auth/register" key={template.key} className="group block">
              <div className="relative">
                {template.isPremium && (
                  <span className="absolute top-2 right-2 z-10 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-800">
                    Premium
                  </span>
                )}
                <TemplateMiniPreview
                  name={template.name}
                  category={template.category}
                  supportsPhoto={template.supportsPhoto}
                />
              </div>
              <div className="mt-2.5">
                <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {template.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16 py-10 bg-gray-50 rounded-2xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to build your resume?</h2>
          <p className="text-gray-600 text-sm mb-6">Pick any template and customize it with AI assistance.</p>
          <Link href="/auth/register">
            <Button size="lg" className="min-h-[48px] px-8 gap-2">
              <Sparkles className="h-5 w-5" />
              Create My Resume
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
