'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, Upload, CheckCircle2, TrendingUp } from 'lucide-react'
import { ResumePreview } from '@/components/resume/ResumePreview'
import { SAMPLE_RESUME_DATA } from '@/lib/resume/sampleData'

const TRUST_BADGES = [
  'No commitment to start',
  'UAE job market ready',
  'Results in under 10 minutes',
]

function AnimatedResumeMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] lg:mx-0">
      {/* Glow backdrop */}
      <div className="absolute inset-0 -z-10 scale-110 rounded-3xl bg-gradient-to-br from-blue-400 via-violet-400 to-indigo-400 opacity-20 blur-3xl" />

      {/* Browser chrome mockup */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl"
      >
        {/* Browser top bar */}
        <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex h-5 max-w-[200px] flex-1 items-center rounded border border-gray-200 bg-white px-2 text-[10px] text-gray-400">
            careerpilot.io/resume/edit
          </div>
        </div>

        {/* Resume preview — top portion */}
        <div className="overflow-hidden" style={{ height: '320px', pointerEvents: 'none' }}>
          <ResumePreview data={SAMPLE_RESUME_DATA} templateKey="dubai-classic" />
        </div>
      </motion.div>

      {/* Floating AI Suggestion card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.5, ease: 'easeOut' }}
        className="absolute -right-4 top-12 max-w-[160px] rounded-xl border border-blue-100 bg-white p-3 shadow-xl sm:-right-8"
      >
        <div className="mb-1.5 flex items-center gap-1.5">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700">
            AI Tip
          </span>
        </div>
        <p className="text-[10px] leading-relaxed text-gray-600">
          Add metrics to your bullets —{' '}
          <span className="font-medium text-blue-600">45% increase</span> beats "improved
          performance"
        </p>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-2 h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-violet-400"
        />
      </motion.div>

      {/* Floating ATS Score card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.5, ease: 'easeOut' }}
        className="absolute -left-4 bottom-10 rounded-xl border border-emerald-100 bg-white p-3 shadow-xl sm:-left-8"
      >
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-gray-400">
          ATS Score
        </p>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold leading-none text-emerald-600">98%</span>
          <span className="mb-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">
            Excellent
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '98%' }}
            transition={{ delay: 1.7, duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
          />
        </div>
      </motion.div>

      {/* Floating "building" indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.4 }}
        className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-violet-600 px-2.5 py-1.5 text-white shadow-lg"
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-1.5 w-1.5 rounded-full bg-white"
        />
        <span className="text-[10px] font-semibold">AI writing…</span>
      </motion.div>
    </div>
  )
}

export function HeroSection() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  }
  const item = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <section className="container mx-auto px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 md:pt-20 lg:px-8">
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
        {/* Left — text */}
        <motion.div
          className="mx-auto max-w-xl flex-1 text-center lg:mx-0 lg:text-left"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={item}>
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500"
              />
              Built for UAE &amp; GCC job seekers
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mb-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
          >
            Land your dream job with a resume that{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              actually gets interviews
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mb-7 text-base leading-relaxed text-gray-600 sm:text-lg"
          >
            Only 2% of resumes pass ATS filters. CareerPilot builds yours with AI optimized
            keywords, professional templates, and interview coaching. All in one platform.
          </motion.p>

          <motion.div
            variants={item}
            className="mb-6 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="min-h-[52px] w-full gap-2 bg-gradient-to-r from-blue-600 to-violet-600 px-8 text-base shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-violet-700 sm:w-auto"
              >
                <Sparkles className="h-5 w-5" />
                Build My Resume Now
              </Button>
            </Link>
            <Link href="/auth/register?upload=true" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="min-h-[52px] w-full gap-2 px-8 text-base sm:w-auto"
              >
                <Upload className="h-5 w-5" />
                Upload Existing CV
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={item}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 lg:justify-start"
          >
            {TRUST_BADGES.map((badge) => (
              <span key={badge} className="flex items-center gap-1 text-xs text-gray-500">
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                {badge}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — animated demo */}
        <div className="w-full flex-1 lg:w-auto lg:flex-none">
          <AnimatedResumeMockup />
        </div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.55 }}
        className="mx-auto mt-14 grid max-w-xl grid-cols-3 gap-4 border-t border-gray-100 pt-8 sm:mt-16 lg:max-w-none"
      >
        {[
          { value: '4,200+', label: 'Resumes created' },
          { value: '1,800+', label: 'Jobs landed' },
          { value: '98%', label: 'ATS pass rate', color: 'text-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={`text-2xl font-bold sm:text-3xl ${stat.color || 'text-gray-900'}`}>
              {stat.value}
            </div>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
