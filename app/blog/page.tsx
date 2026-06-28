import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog | Career Pilot',
  description: 'Career tips, resume writing guides, and job search advice for UAE professionals.',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Career Pilot Blog</h1>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Expert tips and guides on resume writing, interview preparation, and job hunting in the UAE. Coming soon.
        </p>
        <Link href="/" className="text-primary hover:underline text-sm">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
