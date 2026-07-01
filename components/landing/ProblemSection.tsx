'use client'

import { motion } from 'framer-motion'
import { XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal'

const PROBLEMS = [
  { icon: XCircle, text: 'ATS software rejects 98% of resumes before any human reads them', color: 'text-red-500', bg: 'bg-red-50' },
  { icon: AlertTriangle, text: 'Generic templates from Word or Canva fail ATS keyword scanning', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: AlertTriangle, text: 'Writing strong bullet points takes hours — most people guess wrong', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: XCircle, text: 'One resume for every job = low response rate, wasted applications', color: 'text-red-500', bg: 'bg-red-50' },
]

const SOLUTIONS = [
  'AI-optimized for UAE ATS systems',
  'Bullet points generated from your real experience',
  'Tailored to each job description in seconds',
  'Professional templates built by hiring experts',
]

export function ProblemSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

            {/* Left — Problem */}
            <div className="flex-1">
              <ScrollReveal direction="left">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 mb-5">
                  <XCircle className="w-3.5 h-3.5" />
                  The problem
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  Your resume is getting rejected before anyone reads it
                </h2>
                <p className="text-gray-600 text-sm sm:text-base mb-7 leading-relaxed">
                  Most job seekers spend hours on their CV and still get no responses. The system is rigged — unless your resume speaks ATS language.
                </p>
              </ScrollReveal>

              <StaggerContainer stagger={0.1} delay={0.1}>
                <div className="space-y-3">
                  {PROBLEMS.map(({ icon: Icon, text, color, bg }) => (
                    <StaggerItem key={text}>
                      <div className={`flex items-start gap-3 rounded-xl p-3.5 ${bg}`}>
                        <Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
                        <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </div>

            {/* Divider arrow on desktop */}
            <div className="hidden lg:flex flex-col items-center justify-center pt-28">
              <div className="flex flex-col items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.2 + 0.5 }}
                    viewport={{ once: true }}
                    className="w-1.5 h-1.5 rounded-full bg-gradient-to-b from-blue-400 to-violet-400"
                  />
                ))}
                <div className="text-xs font-bold text-blue-600 rotate-90 mt-2">→</div>
              </div>
            </div>

            {/* Right — Solution */}
            <div className="flex-1">
              <ScrollReveal direction="right">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 mb-5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Career Pilot fixes this
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  AI that writes, optimizes, and coaches — so you stop guessing
                </h2>
                <p className="text-gray-600 text-sm sm:text-base mb-7 leading-relaxed">
                  Career Pilot handles the technical stuff so you can focus on what matters — getting in the room.
                </p>
              </ScrollReveal>

              <StaggerContainer stagger={0.1} delay={0.2}>
                <div className="space-y-3">
                  {SOLUTIONS.map((text) => (
                    <StaggerItem key={text}>
                      <div className="flex items-start gap-3 rounded-xl p-3.5 bg-emerald-50 border border-emerald-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
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
