'use client'

import { Star, Quote } from 'lucide-react'
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal'

const testimonials = [
  {
    name: 'Sara Al Mansoori',
    role: 'Marketing Manager',
    company: 'Dubai, UAE',
    initials: 'SA',
    color: 'bg-blue-600',
    quote: 'I applied to 15+ jobs with no response. After rebuilding my CV with Career Pilot, I got 4 interview calls in one week.',
    result: '4 interviews in 1 week',
    rating: 5,
  },
  {
    name: 'Ahmed Rashid',
    role: 'Software Engineer',
    company: 'DIFC, Dubai',
    initials: 'AR',
    color: 'bg-violet-600',
    quote: 'The AI suggestions improved my bullet points so much. My resume finally passes ATS systems, and I landed a role at a top tech company in DIFC.',
    result: 'Landed role at DIFC tech firm',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Finance Analyst',
    company: 'Abu Dhabi, UAE',
    initials: 'PS',
    color: 'bg-emerald-600',
    quote: 'I had no idea my old CV was getting filtered by hiring software. Career Pilot fixed the formatting and keywords — got my first call within days.',
    result: 'First callback in 3 days',
    rating: 5,
  },
  {
    name: 'Omar Hassan',
    role: 'Project Manager',
    company: 'Sharjah, UAE',
    initials: 'OH',
    color: 'bg-orange-500',
    quote: 'The interview prep feature is incredible. I practiced with AI-generated questions and knew exactly what to expect. Got the job on my second interview.',
    result: 'Hired after 2nd interview',
    rating: 5,
  },
  {
    name: 'Fatima Al Zaabi',
    role: 'HR Specialist',
    company: 'Abu Dhabi, UAE',
    initials: 'FZ',
    color: 'bg-pink-600',
    quote: 'As someone who reviews CVs daily, I can say Career Pilot produces resumes that stand out. I used it myself when changing companies.',
    result: 'Hired — as an HR professional',
    rating: 5,
  },
  {
    name: 'David Chen',
    role: 'Data Analyst',
    company: 'Dubai, UAE',
    initials: 'DC',
    color: 'bg-indigo-600',
    quote: 'Created my resume in 10 minutes and got two callbacks the same week. The cover letter generator saved me hours of writing.',
    result: '2 callbacks in 1 week',
    rating: 5,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10 sm:mb-12">
          <div className="flex items-center justify-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-sm font-semibold text-gray-700">4.9 / 5 from 400+ reviews</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gray-900">
            Real results from real job seekers
          </h2>
          <p className="text-gray-600">
            Professionals across the UAE used Career Pilot to land interviews — and jobs.
          </p>
        </ScrollReveal>

        <StaggerContainer stagger={0.08} delay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <StaggerItem key={t.name}>
                <div className="h-full bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <StarRating rating={t.rating} />
                    <Quote className="w-5 h-5 text-gray-200 flex-shrink-0" />
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed flex-1 mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Result badge */}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 mb-4 self-start">
                    ✓ {t.result}
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <div className={`h-9 w-9 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role} · {t.company}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </div>
    </section>
  )
}
