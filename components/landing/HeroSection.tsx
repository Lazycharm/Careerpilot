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
    <div className="relative w-full max-w-[420px] mx-auto lg:mx-0">
      {/* Glow backdrop */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-br from-blue-400 via-violet-400 to-indigo-400 rounded-3xl scale-110" />

      {/* Browser chrome mockup */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200/80 bg-white"
      >
        {/* Browser top bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded border border-gray-200 h-5 text-[10px] text-gray-400 flex items-center px-2 max-w-[200px]">
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
        className="absolute -right-4 sm:-right-8 top-12 bg-white rounded-xl shadow-xl border border-blue-100 p-3 max-w-[160px]"
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">AI Tip</span>
        </div>
        <p className="text-[10px] text-gray-600 leading-relaxed">
          Add metrics to your bullets — <span className="text-blue-600 font-medium">45% increase</span> beats "improved performance"
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
        className="absolute -left-4 sm:-left-8 bottom-10 bg-white rounded-xl shadow-xl border border-emerald-100 p-3"
      >
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1">ATS Score</p>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-emerald-600 leading-none">98%</span>
          <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-semibold mb-0.5">
            Excellent
          </span>
        </div>
        <div className="mt-2 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
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
        className="absolute right-3 bottom-3 bg-violet-600 text-white rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg"
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-white"
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
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-10 sm:pb-14">
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

        {/* Left — text */}
        <motion.div
          className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 mb-5">
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"
              />
              Built for UAE &amp; GCC job seekers
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900 mb-5"
          >
            Land your dream job with a resume that{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              actually gets interviews
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-base sm:text-lg text-gray-600 mb-7 leading-relaxed"
          >
            Only 2% of resumes pass ATS filters. CareerPilot builds yours with AI — optimized keywords,
            professional templates, and interview coaching. All in one platform.
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6"
          >
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto min-h-[52px] px-8 text-base gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/25"
              >
                <Sparkles className="h-5 w-5" />
                Build My Resume Now
              </Button>
            </Link>
            <Link href="/auth/register?upload=true" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto min-h-[52px] px-8 text-base gap-2"
              >
                <Upload className="h-5 w-5" />
                Upload Existing CV
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={item}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1"
          >
            {TRUST_BADGES.map((badge) => (
              <span key={badge} className="flex items-center gap-1 text-xs text-gray-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                {badge}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — animated demo */}
        <div className="flex-1 w-full lg:flex-none lg:w-auto">
          <AnimatedResumeMockup />
        </div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.55 }}
        className="mt-14 sm:mt-16 pt-8 border-t border-gray-100 grid grid-cols-3 gap-4 max-w-xl mx-auto lg:max-w-none"
      >
        {[
          { value: '4,200+', label: 'Resumes created' },
          { value: '1,800+', label: 'Jobs landed' },
          { value: '98%', label: 'ATS pass rate', color: 'text-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={`text-2xl sm:text-3xl font-bold ${stat.color || 'text-gray-900'}`}>
              {stat.value}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
