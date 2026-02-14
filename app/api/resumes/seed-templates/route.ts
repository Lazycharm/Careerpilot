import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Seed default resume templates
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'This endpoint requires admin authentication. Use POST method to seed templates.',
          usage: 'Send a POST request to this endpoint while authenticated as admin'
        },
        { status: 401 }
      )
    }
    
    // Return template count and info
    const templateCount = await prisma.resumeTemplate.count()
    const templates = await prisma.resumeTemplate.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        isPremium: true,
        isActive: true,
      },
    })
    
    return NextResponse.json({
      message: 'Templates endpoint - Use POST to seed templates',
      currentTemplates: templateCount,
      templates: templates,
      instructions: 'Send a POST request to seed/update all templates'
    })
  } catch (error) {
    console.error('Template info error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const templates = [
      {
        name: 'Modern Professional',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: false,
        category: 'modern',
        metadata: {
          templateKey: 'modern-professional',
          description: 'Clean, contemporary design perfect for tech and creative industries',
        },
      },
      {
        name: 'Classic Traditional',
        previewImage: null,
        isActive: true,
        supportsPhoto: false,
        isPremium: false,
        category: 'classic',
        metadata: {
          templateKey: 'classic-traditional',
          description: 'Timeless design ideal for finance, law, and corporate roles',
        },
      },
      {
        name: 'Creative Design',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: false,
        category: 'creative',
        metadata: {
          templateKey: 'creative-design',
          description: 'Bold design perfect for designers, artists, and marketing professionals',
        },
      },
      {
        name: 'Timeline',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: true,
        category: 'modern',
        metadata: {
          templateKey: 'timeline',
          description: 'Chronological layout that tells your career story',
        },
      },
      {
        name: 'Minimalist',
        previewImage: null,
        isActive: true,
        supportsPhoto: false,
        isPremium: false,
        category: 'classic',
        metadata: {
          templateKey: 'minimalist',
          description: 'Ultra-clean design optimized for ATS systems',
        },
      },
      {
        name: 'Executive',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: true,
        category: 'premium',
        metadata: {
          templateKey: 'executive',
          description: 'Sophisticated design for senior executives and C-level positions',
        },
      },
      {
        name: 'Ocean Blue',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: false,
        category: 'modern',
        metadata: {
          templateKey: 'ocean-blue',
          description: 'Fresh blue gradient design perfect for tech and finance',
        },
      },
      {
        name: 'Forest Green',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: false,
        category: 'classic',
        metadata: {
          templateKey: 'forest-green',
          description: 'Natural green design ideal for environmental and healthcare roles',
        },
      },
      {
        name: 'Sunset Orange',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: false,
        category: 'creative',
        metadata: {
          templateKey: 'sunset-orange',
          description: 'Warm orange gradient perfect for creative and marketing roles',
        },
      },
      {
        name: 'Royal Purple',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: true,
        category: 'premium',
        metadata: {
          templateKey: 'royal-purple',
          description: 'Elegant purple design for executive and leadership roles',
        },
      },
      {
        name: 'Midnight Dark',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: true,
        category: 'modern',
        metadata: {
          templateKey: 'midnight-dark',
          description: 'Sophisticated dark theme perfect for tech and design roles',
        },
      },
      {
        name: 'Coral Pink',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: false,
        category: 'creative',
        metadata: {
          templateKey: 'coral-pink',
          description: 'Soft pink design ideal for creative and design professionals',
        },
      },
      {
        name: 'Teal Modern',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: false,
        category: 'modern',
        metadata: {
          templateKey: 'teal-modern',
          description: 'Fresh teal design perfect for healthcare and consulting',
        },
      },
      {
        name: 'Gold Elegant',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: true,
        category: 'premium',
        metadata: {
          templateKey: 'gold-elegant',
          description: 'Luxurious gold design for executive and finance roles',
        },
      },
      {
        name: 'Navy Professional',
        previewImage: null,
        isActive: true,
        supportsPhoto: false,
        isPremium: false,
        category: 'classic',
        metadata: {
          templateKey: 'navy-professional',
          description: 'Classic navy design ideal for corporate and legal roles',
        },
      },
      {
        name: 'Emerald Classic',
        previewImage: null,
        isActive: true,
        supportsPhoto: true,
        isPremium: false,
        category: 'classic',
        metadata: {
          templateKey: 'emerald-classic',
          description: 'Rich emerald design perfect for finance and consulting',
        },
      },
    ]

    const created = await Promise.all(
      templates.map(async (template) => {
        const existing = await prisma.resumeTemplate.findFirst({
          where: { name: template.name },
        })
        
        if (existing) {
          return await prisma.resumeTemplate.update({
            where: { id: existing.id },
            data: template,
          })
        } else {
          return await prisma.resumeTemplate.create({
            data: template,
          })
        }
      })
    )

    return NextResponse.json({
      message: 'Templates seeded successfully',
      count: created.length,
    })
  } catch (error) {
    console.error('Template seed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

