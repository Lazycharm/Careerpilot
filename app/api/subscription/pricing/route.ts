import { NextResponse } from 'next/server'
import { getSettingAsBoolean, getSettingAsNumber } from '@/lib/settings'

export async function GET() {
  try {
    const subscriptionEnabled = await getSettingAsBoolean('subscription_enabled')
    const subscriptionPrice = await getSettingAsNumber('subscription_price')
    const resumePrice = await getSettingAsNumber('resume_download_price')
    const coverLetterPrice = await getSettingAsNumber('cover_letter_price')

    return NextResponse.json({
      subscriptionEnabled,
      subscriptionPrice: subscriptionPrice || 100,
      resumePrice: resumePrice || 50,
      coverLetterPrice: coverLetterPrice || 30,
    })
  } catch (error) {
    console.error('Pricing fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

