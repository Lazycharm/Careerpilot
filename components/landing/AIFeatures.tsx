'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, MessageSquare, Target, BarChart3, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollReveal } from './ScrollReveal'

const FEATURES = [
  {
    id: 'writer',
    icon: Sparkles,
    label: 'AI Resume Writer',
    color: 'blue',
    headline: 'AI writes your bullet points — you just provide the facts',
    description:
      'Tell the AI what you did at each job. It rewrites it with industry keywords, action verbs, and measurable impact — the language that recruiters and ATS systems respond to.',
    bullets: [
      'Generates achievement-focused bullet points',
      'Inserts industry-specific keywords automatically',
      'Tailors content for your target role',
    ],
    demo: <ResumeWriterDemo />,
  },
  {
    id: 'ats',
    icon: Zap,
    label: 'ATS Optimizer',
    color: 'yellow',
    headline: 'Score 95%+ on every ATS scan before you even apply',
    description:
      'Our ATS engine checks your resume against the job description, identifies missing keywords, and tells you exactly what to fix — before you submit.',
    bullets: [
      'Real-time ATS compatibility score',
      'Keyword gap analysis vs. job description',
      'Format and structure checks',
    ],
    demo: <ATSDemo />,
  },
  {
    id: 'coverletter',
    icon: MessageSquare,
    label: 'Cover Letter AI',
    color: 'purple',
    headline: 'A tailored cover letter in 30 seconds, not 30 minutes',
    description:
      'Paste the job description. The AI reads your resume and the role requirements, then writes a personalized cover letter that connects your experience to what the employer needs.',
    bullets: [
      'Matches your resume tone and language',
      'Highlights most relevant experience',
      'Adapts for every job application',
    ],
    demo: <CoverLetterDemo />,
  },
  {
    id: 'interview',
    icon: Target,
    label: 'Interview Prep',
    color: 'green',
    headline: 'Practice with AI-generated questions for your exact role',
    description:
      'Our AI generates role-specific interview questions based on your resume and target job. Practice answering, get scored on clarity and impact, and walk in confident.',
    bullets: [
      'Questions tailored to your role and experience',
      'AI scoring and feedback on your answers',
      'Common UAE/GCC interview patterns',
    ],
    demo: <InterviewDemo />,
  },
]

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   active: 'bg-blue-600 text-white', badge: 'bg-blue-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', active: 'bg-yellow-500 text-white', badge: 'bg-yellow-500' },
  purple: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', active: 'bg-violet-600 text-white', badge: 'bg-violet-600' },
  green:  { bg: 'bg-emerald-50',text: 'text-emerald-600',border: 'border-emerald-200',active: 'bg-emerald-600 text-white', badge: 'bg-emerald-600' },
}

// ── Demo panels ──────────────────────────────────────────────────────────────

function ResumeWriterDemo() {
  const bullets = [
    'Led digital marketing strategy resulting in',
    '↳ 45% increase in online customer acquisition',
    '↳ AED 8M budget managed across 5 channels',
    '↳ Team of 12 specialists mentored and grown',
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="text-xs font-semibold text-gray-500">AI is generating bullet points…</span>
      </div>
      <div className="space-y-2">
        {bullets.map((line, i) => (
          <motion.div
            key={line}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.25 + 0.3 }}
            className={cn(
              'text-sm px-3 py-2 rounded-lg',
              i === 0
                ? 'bg-gray-50 text-gray-600 font-medium'
                : 'bg-blue-50 text-blue-800 font-medium',
            )}
          >
            {line}
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.4 }}
        className="mt-3 text-[10px] text-emerald-600 font-semibold flex items-center gap-1"
      >
        <CheckCircle2 className="w-3 h-3" /> ATS keywords detected: marketing, digital, budget, team leadership
      </motion.div>
    </div>
  )
}

function ATSDemo() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-500">ATS Compatibility Score</span>
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-lg font-bold text-emerald-600"
        >
          94%
        </motion.span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '94%' }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
        />
      </div>
      <div className="space-y-2">
        {[
          { label: 'Keywords matched', value: '18/20', color: 'text-emerald-600' },
          { label: 'Format compatibility', value: 'Pass', color: 'text-emerald-600' },
          { label: 'Missing keywords', value: '2 found', color: 'text-orange-500' },
        ].map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 + 0.8 }}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-gray-500">{label}</span>
            <span className={`font-semibold ${color}`}>{value}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.4 }}
        className="mt-3 bg-orange-50 rounded-lg p-2.5 text-[10px] text-orange-700"
      >
        <strong>Suggestion:</strong> Add "CRM" and "stakeholder management" to your skills section
      </motion.div>
    </div>
  )
}

function CoverLetterDemo() {
  const lines = [
    'Dear Hiring Manager,',
    '',
    "I am excited to apply for the Senior Marketing Manager position at Emirates NBD. With 7+ years of experience leading digital transformation in the UAE's financial sector...",
    '',
    'My track record of delivering 45% growth in online acquisition...',
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-0.5 h-4 bg-violet-500"
        />
        <span className="text-xs font-semibold text-gray-500">Generating your cover letter…</span>
      </div>
      <div className="space-y-1.5">
        {lines.map((line, i) =>
          line === '' ? (
            <div key={i} className="h-2" />
          ) : (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.3 + 0.2 }}
              className="text-xs text-gray-700 leading-relaxed"
            >
              {line}
            </motion.p>
          )
        )}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.8 }}
        className="mt-3 text-[10px] text-violet-600 font-semibold"
      >
        ✓ Tailored to Senior Marketing Manager at Emirates NBD
      </motion.div>
    </div>
  )
}

function InterviewDemo() {
  const qas = [
    { q: 'Tell me about a time you led a large marketing campaign.', score: 88 },
    { q: 'How do you handle budget pressure while maintaining campaign quality?', score: null },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
      {qas.map(({ q, score }, i) => (
        <motion.div
          key={q}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.4 + 0.2 }}
          className="rounded-lg bg-gray-50 p-3"
        >
          <p className="text-xs font-medium text-gray-700 mb-2">Q: {q}</p>
          {score !== null ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${score}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
              <span className="text-xs font-bold text-emerald-600">{score}/100</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              />
              <span className="text-[10px] text-gray-400">Waiting for your answer…</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AIFeatures() {
  const [active, setActive] = useState('writer')
  const activeFeature = FEATURES.find((f) => f.id === active)!

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10 sm:mb-12">
          <span className="inline-block rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs font-semibold text-violet-700 mb-4">
            AI-Powered Platform
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gray-900">
            Everything powered by AI — built for results
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Four AI tools working together so you stop guessing and start landing interviews.
          </p>
        </ScrollReveal>

        {/* Tab selector */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10">
            {FEATURES.map((f) => {
              const Icon = f.icon
              const colors = COLOR_MAP[f.color as keyof typeof COLOR_MAP]
              const isActive = active === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setActive(f.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px] border',
                    isActive
                      ? `${colors.active} border-transparent shadow-md`
                      : `bg-white ${colors.text} ${colors.border} hover:${colors.bg}`,
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {f.label}
                </button>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Active feature panel */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center"
            >
              {/* Text */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                  {activeFeature.headline}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-5 leading-relaxed">
                  {activeFeature.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {activeFeature.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Demo panel */}
              <div className="flex-1 w-full max-w-sm">
                {activeFeature.demo}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
