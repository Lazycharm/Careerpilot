'use client'

import { cn } from '@/lib/utils'

interface TemplateColors {
  primary: string
  secondary: string
  headerBg?: string
  textOnHeader?: string
  sidebarBg?: string
}

const TEMPLATE_COLORS: Record<string, TemplateColors> = {
  // Original templates
  'dubai-classic': { primary: '#1d4ed8', secondary: '#1e3a8a' },
  'sharjah-minimal': { primary: '#374151', secondary: '#6b7280' },
  'abu-dhabi-executive': { primary: '#7c2d12', secondary: '#991b1b', headerBg: 'none' },
  'gulf-modern': { primary: '#0d9488', secondary: '#047857' },
  // UAE Banking
  'uae-banking': { primary: '#1e3a5f', secondary: '#1e40af' },
  // UAE Tech
  'uae-tech': { primary: '#2563eb', secondary: '#1d4ed8', sidebarBg: '#0f172a' },
  // UAE Hospitality
  'uae-hospitality': { primary: '#92400e', secondary: '#b45309', headerBg: 'linear-gradient(135deg,#92400e,#d97706)' },
  // UAE Healthcare
  'uae-healthcare': { primary: '#0f766e', secondary: '#0d9488', headerBg: '#0f766e' },
  // UAE Government
  'uae-government': { primary: '#1e3a5f', secondary: '#1e3a8a' },
  // UAE Creative
  'uae-creative': { primary: '#7c3aed', secondary: '#5b21b6', sidebarBg: 'linear-gradient(180deg,#5b21b6,#7c3aed)' },
  // UAE Marketing
  'uae-marketing': { primary: '#7c3aed', secondary: '#a855f7', headerBg: 'linear-gradient(135deg,#7c3aed,#ec4899)' },
  // UAE Startup
  'uae-startup': { primary: '#ea580c', secondary: '#dc2626' },
  // UAE Photo Executive
  'uae-photo-executive': { primary: '#b45309', secondary: '#92400e' },
  // UAE Legal
  'uae-legal': { primary: '#1c1917', secondary: '#292524' },
  // UAE Retail
  'uae-retail': { primary: '#059669', secondary: '#047857', headerBg: '#059669' },
  // UAE Education
  'uae-education': { primary: '#1e40af', secondary: '#1d4ed8' },
  // UAE Gold
  'uae-gold': { primary: '#b45309', secondary: '#92400e', headerBg: '#0c0a09' },
  // UAE Photo Modern
  'uae-photo-modern': { primary: '#0e7490', secondary: '#0891b2', headerBg: '#0e7490' },
  // UAE Desert
  'uae-desert': { primary: '#92400e', secondary: '#c2410c', headerBg: 'linear-gradient(135deg,#92400e,#c2410c)' },
  // ATS templates
  'ats-pure': { primary: '#000000', secondary: '#333333' },
  'ats-professional': { primary: '#1a1a1a', secondary: '#333333' },
  'ats-finance': { primary: '#000000', secondary: '#333333' },
  'ats-tech': { primary: '#000000', secondary: '#222222' },
  'ats-management': { primary: '#000000', secondary: '#1a1a1a' },
}

const CATEGORY_FALLBACKS: Record<string, TemplateColors> = {
  modern: { primary: '#667eea', secondary: '#764ba2', headerBg: 'linear-gradient(135deg,#667eea,#764ba2)' },
  classic: { primary: '#1a1a1a', secondary: '#333333' },
  creative: { primary: '#e74c3c', secondary: '#c0392b', headerBg: '#e74c3c' },
  premium: { primary: '#b8860b', secondary: '#8b6914', headerBg: 'linear-gradient(135deg,#b8860b,#daa520)' },
  executive: { primary: '#7c2d12', secondary: '#991b1b' },
  minimal: { primary: '#374151', secondary: '#6b7280' },
  specialty: { primary: '#0f766e', secondary: '#0d9488', headerBg: '#0f766e' },
  ats: { primary: '#1a1a1a', secondary: '#333333' },
}

interface TemplateMiniPreviewProps {
  name: string
  category: string
  templateKey?: string
  supportsPhoto?: boolean
  isSelected?: boolean
}

export function TemplateMiniPreview({ name, category, templateKey, supportsPhoto, isSelected }: TemplateMiniPreviewProps) {
  const key = templateKey || name.toLowerCase().replace(/\s+/g, '-')
  const colors = TEMPLATE_COLORS[key] || CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS['modern']
  const hasSidebar = !!colors.sidebarBg
  const hasColorHeader = !!colors.headerBg
  const isAts = category === 'ats'

  return (
    <div className={cn(
      'aspect-[8.5/11] w-full rounded-md bg-white border overflow-hidden shadow-sm',
      isSelected ? 'ring-2 ring-primary ring-offset-1' : 'border-gray-200'
    )}>
      {hasSidebar ? (
        // Two-column preview (sidebar layout)
        <div className="h-full flex">
          <div className="w-[35%] h-full" style={{ background: colors.sidebarBg }}>
            <div className="p-1.5">
              {supportsPhoto && (
                <div className="w-6 h-6 rounded-full bg-white/20 mb-1.5 mx-auto" />
              )}
              <div className="h-1.5 w-3/4 rounded-sm bg-white/60 mb-0.5" />
              <div className="h-1 w-2/3 rounded-sm bg-white/30 mb-2" />
              {[12, 10, 8, 11, 9].map((w, i) => (
                <div key={i} className={`h-0.5 rounded-sm bg-white/25 mb-0.5`} style={{ width: `${w * 6}%` }} />
              ))}
            </div>
          </div>
          <div className="flex-1 p-1.5 flex flex-col gap-1.5">
            <div className="h-1 w-2/3 rounded-sm" style={{ backgroundColor: colors.primary }} />
            {[100, 90, 80, 100, 85, 70, 95].map((w, i) => (
              <div key={i} className="h-0.5 rounded-sm bg-gray-200" style={{ width: `${w}%` }} />
            ))}
            <div className="h-1 w-1/2 rounded-sm mt-0.5" style={{ backgroundColor: colors.primary }} />
            {[100, 75].map((w, i) => (
              <div key={i} className="h-0.5 rounded-sm bg-gray-200" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      ) : (
        // Standard single-column preview
        <div className="h-full flex flex-col">
          {/* Header area */}
          {hasColorHeader ? (
            <div className="px-2 py-1.5 sm:py-2 flex-shrink-0" style={{ background: colors.headerBg }}>
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
            <div className="p-2 sm:p-2.5 pb-1.5 flex-shrink-0" style={{ borderBottom: `2px solid ${colors.primary}` }}>
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

          {/* Content */}
          <div className="flex-1 p-1.5 sm:p-2 flex flex-col gap-1.5">
            {isAts ? (
              // ATS preview — plain text-like blocks
              <>
                <div className="h-1 w-1/3 rounded-sm bg-gray-800" />
                <div className="h-0.5 w-full rounded-sm bg-gray-800" />
                {[100, 90, 80, 100, 85, 70, 95, 80].map((w, i) => (
                  <div key={i} className="h-0.5 rounded-sm bg-gray-300" style={{ width: `${w}%` }} />
                ))}
                <div className="h-1 w-1/4 rounded-sm bg-gray-800 mt-0.5" />
                {[100, 70].map((w, i) => (
                  <div key={i} className="h-0.5 rounded-sm bg-gray-300" style={{ width: `${w}%` }} />
                ))}
              </>
            ) : (
              <>
                <div>
                  <div className="h-1 sm:h-1.5 w-1/3 rounded-sm mb-1" style={{ backgroundColor: colors.primary }} />
                  <div className="space-y-0.5">
                    <div className="h-0.5 sm:h-1 w-full rounded-sm bg-gray-200" />
                    <div className="h-0.5 sm:h-1 w-5/6 rounded-sm bg-gray-150" style={{ backgroundColor: '#e5e7eb' }} />
                    <div className="h-0.5 sm:h-1 w-4/5 rounded-sm bg-gray-100" />
                  </div>
                </div>
                <div>
                  <div className="h-1 sm:h-1.5 w-2/5 rounded-sm mb-1" style={{ backgroundColor: colors.primary }} />
                  <div className="space-y-0.5">
                    <div className="h-0.5 sm:h-1 w-full rounded-sm bg-gray-200" />
                    <div className="h-0.5 sm:h-1 w-3/4 rounded-sm bg-gray-100" />
                  </div>
                </div>
                <div>
                  <div className="h-1 sm:h-1.5 w-1/4 rounded-sm mb-1" style={{ backgroundColor: colors.primary }} />
                  <div className="flex gap-0.5 sm:gap-1 flex-wrap">
                    <div className="h-0.5 sm:h-1 w-8 rounded-sm bg-gray-200" />
                    <div className="h-0.5 sm:h-1 w-6 rounded-sm bg-gray-200" />
                    <div className="h-0.5 sm:h-1 w-10 rounded-sm bg-gray-200" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
