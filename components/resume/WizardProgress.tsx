'use client'

import { cn } from '@/lib/utils'
import { User, Briefcase, GraduationCap, Wrench, FileText, Settings } from 'lucide-react'

const steps = [
  { id: 'contacts', label: 'Contact', icon: User, anchor: 'section-personal' },
  { id: 'experience', label: 'Experience', icon: Briefcase, anchor: 'section-experience' },
  { id: 'education', label: 'Education', icon: GraduationCap, anchor: 'section-education' },
  { id: 'skills', label: 'Skills', icon: Wrench, anchor: 'section-skills' },
  { id: 'summary', label: 'Summary', icon: FileText, anchor: 'section-summary' },
  { id: 'finalize', label: 'Finalize', icon: Settings, anchor: 'section-finalize' },
]

interface WizardProgressProps {
  completedSections: Record<string, boolean>
  activeSection?: string
}

export function WizardProgress({ completedSections, activeSection }: WizardProgressProps) {
  const handleClick = (anchor: string) => {
    const el = document.getElementById(anchor)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="bg-white border-b sticky top-[64px] sm:top-[80px] z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-3 overflow-x-auto scrollbar-hide gap-1">
          {steps.map((step, i) => {
            const isCompleted = completedSections[step.id]
            const isActive = activeSection === step.id
            const Icon = step.icon

            return (
              <button
                key={step.id}
                onClick={() => handleClick(step.anchor)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[36px]',
                  isActive && 'bg-primary text-white',
                  isCompleted && !isActive && 'bg-green-50 text-green-700',
                  !isActive && !isCompleted && 'text-gray-500 hover:bg-gray-100'
                )}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{step.label}</span>
                {isCompleted && !isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 rounded-full -mt-1 mb-1">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{
              width: `${(Object.values(completedSections).filter(Boolean).length / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
