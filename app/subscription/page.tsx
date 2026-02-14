'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { CheckCircle2, XCircle, CreditCard } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  startDate: string
  endDate: string | null
}

interface Pricing {
  resumePrice: number
  coverLetterPrice: number
  subscriptionPrice: number
  subscriptionEnabled: boolean
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [pricing, setPricing] = useState<Pricing | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') {
      fetchData()
      
      // Check for success/error messages in URL
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true') {
        alert('Subscription activated successfully!')
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)
      }
      if (params.get('error')) {
        alert(`Error: ${params.get('error')}`)
        window.history.replaceState({}, '', window.location.pathname)
      }
      if (params.get('cancelled') === 'true') {
        alert('Payment was cancelled')
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const [subResponse, pricingResponse] = await Promise.all([
        fetch('/api/subscription'),
        fetch('/api/subscription/pricing'),
      ])

      if (subResponse.ok) {
        const subData = await subResponse.json()
        setSubscription(subData.subscription)
      }

      if (pricingResponse.ok) {
        const pricingData = await pricingResponse.json()
        setPricing(pricingData)
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    setProcessing(true)
    try {
      const subscriptionPrice = pricing?.subscriptionPrice || 100
      
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          amount: subscriptionPrice,
          redirect: window.location.pathname,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Ziina payment page
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl
        } else {
          alert('Payment URL not received')
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create payment')
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const isActive = subscription?.status === 'active' && (
    !subscription.endDate || new Date(subscription.endDate) > new Date()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Premium Subscription</h1>

        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isActive ? (
                <div className="flex items-start sm:items-center gap-3 text-green-600">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base">Active Subscription</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Started: {new Date(subscription!.startDate).toLocaleDateString()}
                      {subscription!.endDate && (
                        <> • Expires: {new Date(subscription!.endDate).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start sm:items-center gap-3 text-gray-600">
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base">No Active Subscription</p>
                    <p className="text-xs sm:text-sm mt-1">Subscribe to unlock all features</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Info */}
          {pricing && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricing.subscriptionEnabled ? (
                  <>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span>Resume Download</span>
                      <span className="font-semibold">{pricing.resumePrice} AED</span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span>Cover Letter Download</span>
                      <span className="font-semibold">{pricing.coverLetterPrice} AED</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                        <span className="text-base sm:text-lg font-semibold">Premium Subscription</span>
                        <span className="text-xl sm:text-2xl font-bold text-primary">
                          {pricing.subscriptionPrice || 100} AED
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs sm:text-sm text-gray-600 mb-4">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Unlimited ATS-optimized resume downloads</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Unlimited cover letter downloads</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Full access to all AI-powered features</span>
                        </li>
                      </ul>
                      {!isActive && (
                        <Button onClick={handleSubscribe} disabled={processing} className="w-full min-h-[48px] text-base sm:text-lg">
                          <CreditCard className="h-4 w-4 mr-2" />
                          {processing ? 'Processing...' : 'Subscribe Now'}
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">Subscriptions are currently disabled by admin.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>What You Get</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Unlimited Downloads</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Download as many ATS-optimized resumes and cover letters as you need</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">AI-Powered Features</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Full access to resume optimization and interview prep for UAE jobs</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Priority Support</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Get help when you need it</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

