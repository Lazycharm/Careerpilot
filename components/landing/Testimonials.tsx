'use client'

import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    name: 'Sara Al Mansoori',
    role: 'Marketing Manager',
    quote: 'I applied to 15+ jobs in Dubai with no response. After rebuilding my CV with Career Pilot, I got 4 interview calls in one week.',
    rating: 5,
  },
  {
    name: 'Ahmed Rashid',
    role: 'Software Engineer',
    quote: 'The AI suggestions improved my bullet points so much. My resume finally passes ATS systems, and I landed a role at a top tech company in DIFC.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Finance Analyst',
    quote: 'I had no idea my old CV was getting filtered out by hiring software. Career Pilot fixed the formatting and keywords — got my first call within days.',
    rating: 5,
  },
  {
    name: 'Omar Hassan',
    role: 'Project Manager',
    quote: 'The interview prep feature is incredible. I practiced with AI-generated questions and knew exactly what to expect. Got the job on my second interview.',
    rating: 5,
  },
  {
    name: 'Fatima Al Zaabi',
    role: 'HR Specialist',
    quote: 'As someone who reviews CVs daily, I can tell you Career Pilot produces resumes that stand out. I used it myself when changing companies.',
    rating: 5,
  },
  {
    name: 'David Chen',
    role: 'Data Analyst',
    quote: 'Created my resume in 10 minutes and got two callbacks the same week. The cover letter generator saved me hours of writing.',
    rating: 5,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            What our users are saying
          </h2>
          <p className="text-gray-600">
            Real results from job seekers across the UAE
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 sm:p-6">
                <StarRating rating={t.rating} />
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
