'use client'

import { motion } from 'framer-motion'
import { XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal'

const PROBLEMS = [
  {
    icon: XCircle,
    text: 'ATS software rejects 98% of resumes before any human reads them',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
  {
    icon: AlertTriangle,
    text: 'Generic templates from Word or Canva fail ATS keyword scanning',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    icon: AlertTriangle,
    text: 'Writing strong bullet points takes hours — most people guess wrong',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    icon: XCircle,
    text: 'One resume for every job = low response rate, wasted applications',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
]

const SOLUTIONS = [
  'AI-optimized for UAE ATS systems',
  'Bullet points generated from your real experience',
  'Tailored to each job description in seconds',
  'Professional templates built by hiring experts',
]

export function ProblemSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-start gap-10 lg:flex-row lg:gap-16">
            {/* Left — Problem */}
            <div className="flex-1">
              <ScrollReveal direction="left">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  <XCircle className="h-3.5 w-3.5" />
                  The problem
                </div>
                <h2 className="mb-4 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                  Your resume is getting rejected before anyone reads it
                </h2>
                <p className="mb-7 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Most job seekers spend hours on their CV and still get no responses. The system is
                  rigged unless your resume speaks ATS language.
                </p>
              </ScrollReveal>

              <StaggerContainer stagger={0.1} delay={0.1}>
                <div className="space-y-3">
                  {PROBLEMS.map(({ icon: Icon, text, color, bg }) => (
                    <StaggerItem key={text}>
                      <div className={`flex items-start gap-3 rounded-xl p-3.5 ${bg}`}>
                        <Icon className={`h-5 w-5 ${color} mt-0.5 flex-shrink-0`} />
                        <p className="text-sm leading-relaxed text-gray-700">{text}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </div>

            {/* Divider arrow on desktop */}
            <div className="hidden flex-col items-center justify-center pt-28 lg:flex">
              <div className="flex flex-col items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.2 + 0.5 }}
                    viewport={{ once: true }}
                    className="h-1.5 w-1.5 rounded-full bg-gradient-to-b from-blue-400 to-violet-400"
                  />
                ))}
                <div className="mt-2 rotate-90 text-xs font-bold text-blue-600">→</div>
              </div>
            </div>

            {/* Right — Solution */}
            <div className="flex-1">
              <ScrollReveal direction="right">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Career Pilot fixes this
                </div>
                <h2 className="mb-4 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                  AI that writes, optimizes, and coaches so you stop guessing
                </h2>
                <p className="mb-7 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Career Pilot handles the technical stuff so you can focus on what matters getting
                  in the room.
                </p>
              </ScrollReveal>

              <StaggerContainer stagger={0.1} delay={0.2}>
                <div className="space-y-3">
                  {SOLUTIONS.map((text) => (
                    <StaggerItem key={text}>
                      <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                        <p className="text-sm leading-relaxed text-gray-700">{text}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
