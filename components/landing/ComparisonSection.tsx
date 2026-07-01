'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { X, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal'

const ROWS = [
  { label: 'ATS keyword optimization',       diy: false, cp: true },
  { label: 'AI-generated bullet points',     diy: false, cp: true },
  { label: 'UAE & GCC market templates',     diy: false, cp: true },
  { label: 'ATS score before applying',      diy: false, cp: true },
  { label: 'Cover letter generator',         diy: false, cp: true },
  { label: 'Job-specific tailoring',         diy: false, cp: true },
  { label: 'Interview prep & AI coaching',   diy: false, cp: true },
  { label: 'Ready in under 10 minutes',      diy: false, cp: true },
]

export function ComparisonSection() {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gray-900">
            Why Career Pilot beats doing it yourself
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Building a job-winning resume alone takes days of research, guesswork, and frustration. Here's what changes.
          </p>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto">
          {/* Table header */}
          <ScrollReveal>
            <div className="grid grid-cols-3 gap-3 mb-3 text-center">
              <div /> {/* empty cell */}
              <div className="bg-gray-200 rounded-xl py-3 px-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">DIY / Word / Canva</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl py-3 px-2 shadow-lg shadow-blue-500/20">
                <p className="text-xs font-bold text-white uppercase tracking-wide flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Career Pilot
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Rows */}
          <StaggerContainer stagger={0.07} delay={0.1}>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
              {ROWS.map(({ label, diy, cp }) => (
                <StaggerItem key={label}>
                  <div className="grid grid-cols-3 gap-3 px-4 py-3 items-center">
                    <p className="text-sm text-gray-700 font-medium leading-snug">{label}</p>
                    <div className="flex justify-center">
                      {diy ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div className="flex justify-center">
                      {cp ? (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </motion.div>
                      ) : (
                        <X className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>

          {/* CTA below table */}
          <ScrollReveal delay={0.3} className="text-center mt-8">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="min-h-[52px] px-10 gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/25"
              >
                <Sparkles className="h-5 w-5" />
                Start Building — Get Hired Faster
              </Button>
            </Link>
            <p className="text-xs text-gray-400 mt-3">Join 4,200+ UAE professionals who landed interviews with Career Pilot</p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
