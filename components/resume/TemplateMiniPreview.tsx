'use client'

import { cn } from '@/lib/utils'

const templateColorMap: Record<string, { primary: string; secondary: string; headerBg?: string; textOnHeader?: string }> = {
  'modern': { primary: '#667eea', secondary: '#764ba2', headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textOnHeader: '#fff' },
  'classic': { primary: '#1a1a1a', secondary: '#333333' },
  'creative': { primary: '#e74c3c', secondary: '#c0392b', headerBg: '#e74c3c', textOnHeader: '#fff' },
  'premium': { primary: '#b8860b', secondary: '#8b6914', headerBg: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)', textOnHeader: '#fff' },
}

const nameColorMap: Record<string, { primary: string; secondary: string; headerBg?: string }> = {
  'ocean blue': { primary: '#0077b6', secondary: '#00b4d8', headerBg: 'linear-gradient(135deg, #0077b6, #00b4d8)' },
  'forest green': { primary: '#2d6a4f', secondary: '#40916c', headerBg: 'linear-gradient(135deg, #2d6a4f, #40916c)' },
  'sunset orange': { primary: '#e76f51', secondary: '#f4a261', headerBg: 'linear-gradient(135deg, #e76f51, #f4a261)' },
  'royal purple': { primary: '#7209b7', secondary: '#560bad', headerBg: 'linear-gradient(135deg, #7209b7, #560bad)' },
  'midnight dark': { primary: '#1a1a2e', secondary: '#16213e', headerBg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  'coral pink': { primary: '#ff6b6b', secondary: '#ee5a70', headerBg: 'linear-gradient(135deg, #ff6b6b, #ee5a70)' },
  'teal modern': { primary: '#0d9488', secondary: '#14b8a6', headerBg: 'linear-gradient(135deg, #0d9488, #14b8a6)' },
  'gold elegant': { primary: '#b8860b', secondary: '#daa520', headerBg: 'linear-gradient(135deg, #b8860b, #daa520)' },
  'navy professional': { primary: '#1e3a5f', secondary: '#2563eb', headerBg: 'linear-gradient(135deg, #1e3a5f, #2563eb)' },
  'emerald classic': { primary: '#047857', secondary: '#059669', headerBg: 'linear-gradient(135deg, #047857, #059669)' },
  'minimalist': { primary: '#333333', secondary: '#666666' },
  'timeline': { primary: '#4f46e5', secondary: '#6366f1', headerBg: 'linear-gradient(135deg, #4f46e5, #6366f1)' },
  'executive': { primary: '#1a1a2e', secondary: '#16213e', headerBg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  'modern professional': { primary: '#667eea', secondary: '#764ba2', headerBg: 'linear-gradient(135deg, #667eea, #764ba2)' },
  'classic traditional': { primary: '#1a1a1a', secondary: '#333333' },
  'creative design': { primary: '#e74c3c', secondary: '#c0392b', headerBg: '#e74c3c' },
}

interface TemplateMiniPreviewProps {
  name: string
  category: string
  supportsPhoto?: boolean
  isSelected?: boolean
}

export function TemplateMiniPreview({ name, category, supportsPhoto, isSelected }: TemplateMiniPreviewProps) {
  const nameLower = name.toLowerCase()
  const colors = nameColorMap[nameLower] || templateColorMap[category] || templateColorMap['modern']
  const hasHeader = !!colors.headerBg

  return (
    <div className={cn(
      'aspect-[8.5/11] w-full rounded-md bg-white border overflow-hidden shadow-sm',
      isSelected ? 'ring-2 ring-primary ring-offset-1' : 'border-gray-200'
    )}>
      <div className="h-full flex flex-col p-2 sm:p-2.5">
        {/* Header area */}
        {hasHeader ? (
          <div className="rounded-sm mb-1.5 sm:mb-2 px-2 py-1.5 sm:py-2" style={{ background: colors.headerBg }}>
            <div className="flex items-center gap-1.5">
              {supportsPhoto && (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/30 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="h-1.5 sm:h-2 w-3/4 rounded-sm bg-white/80 mb-0.5 sm:mb-1" />
                <div className="h-1 w-1/2 rounded-sm bg-white/50" />
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-1.5 sm:mb-2 pb-1.5 sm:pb-2" style={{ borderBottom: `2px solid ${colors.primary}` }}>
            <div className="flex items-center gap-1.5">
              {supportsPhoto && (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 flex-shrink-0" style={{ border: `1.5px solid ${colors.primary}` }} />
              )}
              <div className="flex-1">
                <div className="h-1.5 sm:h-2 w-3/4 rounded-sm mb-0.5 sm:mb-1" style={{ backgroundColor: colors.primary }} />
                <div className="h-1 w-1/2 rounded-sm bg-gray-300" />
              </div>
            </div>
          </div>
        )}

        {/* Section: Experience */}
        <div className="mb-1.5 sm:mb-2">
          <div className="h-1 sm:h-1.5 w-1/3 rounded-sm mb-1" style={{ backgroundColor: colors.primary }} />
          <div className="space-y-0.5">
            <div className="h-0.5 sm:h-1 w-full rounded-sm bg-gray-200" />
            <div className="h-0.5 sm:h-1 w-5/6 rounded-sm bg-gray-150" style={{ backgroundColor: '#e5e7eb' }} />
            <div className="h-0.5 sm:h-1 w-4/5 rounded-sm bg-gray-100" />
          </div>
        </div>

        {/* Section: Education */}
        <div className="mb-1.5 sm:mb-2">
          <div className="h-1 sm:h-1.5 w-2/5 rounded-sm mb-1" style={{ backgroundColor: colors.primary }} />
          <div className="space-y-0.5">
            <div className="h-0.5 sm:h-1 w-full rounded-sm bg-gray-200" />
            <div className="h-0.5 sm:h-1 w-3/4 rounded-sm bg-gray-100" />
          </div>
        </div>

        {/* Section: Skills */}
        <div>
          <div className="h-1 sm:h-1.5 w-1/4 rounded-sm mb-1" style={{ backgroundColor: colors.primary }} />
          <div className="flex gap-0.5 sm:gap-1 flex-wrap">
            <div className="h-0.5 sm:h-1 w-8 rounded-sm bg-gray-200" />
            <div className="h-0.5 sm:h-1 w-6 rounded-sm bg-gray-200" />
            <div className="h-0.5 sm:h-1 w-10 rounded-sm bg-gray-200" />
            <div className="h-0.5 sm:h-1 w-5 rounded-sm bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
