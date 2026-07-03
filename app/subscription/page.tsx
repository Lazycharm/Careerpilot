'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/shared/Navbar'
import { CheckCircle2, XCircle, CreditCard, Tag, X, Loader2 } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  startDate: string
  endDate: string | null
}

interface PricingPlan {
  id: string
  code: string
  name: string
  amountFils: number
  currency: string
  isActive: boolean
}

interface CouponResult {
  valid: boolean
  error?: string
  coupon?: {
    code: string
    discountFils: number
    finalAmountFils: number
    description?: string
  }
}

function filsToAED(fils: number) {
  return (fils / 100).toFixed(2)
}

// Which plan code to use for the main subscription CTA
const PRIMARY_PLAN = 'pro'

const PLANS: { code: string; label: string; highlight?: boolean }[] = [
  { code: 'starter', label: 'Starter Bundle' },
  { code: 'pro', label: 'Pro Bundle', highlight: true },
  { code: 'pro_annual', label: 'Pro Annual' },
  { code: 'automation', label: 'Automation' },
  { code: 'growth', label: 'Growth Bundle' },
]

export default function SubscriptionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>(PRIMARY_PLAN)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // Coupon state
  const [couponInput, setCouponInput] = useState('')
  const [couponState, setCouponState] = useState<'idle' | 'checking' | 'applied' | 'error'>('idle')
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null)
  const couponDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return }
    if (status === 'authenticated') fetchData()
  }, [status, router])

  // Handle success/cancel query params without alert()
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') || params.get('error') || params.get('cancelled')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const fetchData = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch('/api/subscription'),
        fetch('/api/pricing'),
      ])
      if (subRes.ok) {
        const d = await subRes.json()
        setSubscription(d.subscription)
      }
      if (plansRes.ok) {
        const d = await plansRes.json()
        // Accept array or { plans: [] } shape
        const arr: PricingPlan[] = Array.isArray(d) ? d : (d.plans ?? [])
        setPlans(arr.filter((p) => p.isActive))
      }
    } catch (e) {
      console.error('Failed to fetch subscription data:', e)
    } finally {
      setLoading(false)
    }
  }

  const currentPlan = plans.find((p) => p.code === selectedPlan)

  // Validate coupon whenever input changes (debounced)
  const handleCouponInput = (val: string) => {
    setCouponInput(val)
    setCouponResult(null)
    setCouponState('idle')
    if (couponDebounce.current) clearTimeout(couponDebounce.current)
    if (!val.trim()) return
    couponDebounce.current = setTimeout(() => applyCoupon(val.trim()), 600)
  }

  const applyCoupon = async (code: string) => {
    if (!currentPlan) return
    setCouponState('checking')
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase(), pricingCode: selectedPlan }),
      })
      const data: CouponResult = await res.json()
      setCouponResult(data)
      setCouponState(data.valid ? 'applied' : 'error')
    } catch {
      setCouponState('error')
      setCouponResult({ valid: false, error: 'Could not check coupon. Please try again.' })
    }
  }

  const clearCoupon = () => {
    setCouponInput('')
    setCouponResult(null)
    setCouponState('idle')
  }

  const effectiveAmount = couponResult?.valid && couponResult.coupon
    ? couponResult.coupon.finalAmountFils
    : currentPlan?.amountFils ?? 0

  const handleCheckout = async () => {
    setProcessing(true)
    try {
      const methodsRes = await fetch('/api/payments/methods', { cache: 'no-store' })
      const methodsJson = await methodsRes.json() as { methods?: Array<'whatsapp' | 'ziina'> }
      const enabled = methodsJson.methods ?? []
      if (enabled.length === 0) {
        alert('Payments are temporarily unavailable. Please try again later.')
        return
      }
      const method: 'whatsapp' | 'ziina' = enabled.includes('ziina') ? 'ziina' : 'whatsapp'

      const res = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pricingCode: selectedPlan,
          method,
          ...(couponResult?.valid && couponInput ? { couponCode: couponInput.toUpperCase() } : {}),
        }),
      })

      if (res.ok) {
        const data = await res.json() as { redirectUrl?: string }
        if (data.redirectUrl) window.location.href = data.redirectUrl
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to create payment')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-8" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  const isActive = subscription?.status === 'active' &&
    (!subscription.endDate || new Date(subscription.endDate) > new Date())

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Upgrade Your Plan</h1>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          Pick the plan that fits you. All prices in AED.
        </p>

        {/* Current subscription banner */}
        {isActive && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="py-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">You have an active subscription</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Started {new Date(subscription!.startDate).toLocaleDateString()}
                  {subscription!.endDate && ` · Expires ${new Date(subscription!.endDate).toLocaleDateString()}`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan selector */}
        {plans.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {PLANS.map(({ code, label, highlight }) => {
              const plan = plans.find((p) => p.code === code)
              if (!plan) return null
              const selected = selectedPlan === code
              return (
                <button
                  key={code}
                  onClick={() => { setSelectedPlan(code); clearCoupon() }}
                  className={`text-left rounded-xl border-2 p-4 transition-all ${
                    selected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-sm">{plan.name}</span>
                    {highlight && (
                      <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold">
                    {filsToAED(plan.amountFils)} <span className="text-sm font-normal text-muted-foreground">AED</span>
                  </p>
                  {selected && <div className="mt-2 w-4 h-1 rounded bg-primary" />}
                </button>
              )
            })}
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="py-6 text-center text-muted-foreground text-sm">
              No plans available right now. Please check back soon.
            </CardContent>
          </Card>
        )}

        {/* Checkout card */}
        {currentPlan && !isActive && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-base">Checkout — {currentPlan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Price display */}
              <div className="flex items-baseline gap-3">
                {couponResult?.valid && couponResult.coupon ? (
                  <>
                    <span className="text-2xl font-bold text-primary">
                      {filsToAED(couponResult.coupon.finalAmountFils)} AED
                    </span>
                    <span className="text-base line-through text-muted-foreground">
                      {filsToAED(currentPlan.amountFils)} AED
                    </span>
                    <span className="text-sm text-emerald-600 font-medium">
                      −{filsToAED(couponResult.coupon.discountFils)} AED saved
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">
                    {filsToAED(currentPlan.amountFils)} AED
                  </span>
                )}
              </div>

              {/* Coupon input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Coupon code
                </label>
                <div className="relative flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => handleCouponInput(e.target.value)}
                    placeholder="e.g. WELCOME50"
                    className="font-mono uppercase pr-8"
                    disabled={couponState === 'checking'}
                  />
                  {couponInput && couponState !== 'checking' && (
                    <button
                      onClick={clearCoupon}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {couponState === 'checking' && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {couponState === 'applied' && couponResult?.valid && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {couponResult.coupon?.description ?? 'Discount applied!'}
                  </p>
                )}
                {couponState === 'error' && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {couponResult?.error ?? 'Invalid coupon code'}
                  </p>
                )}
              </div>

              {/* CTA */}
              <Button
                onClick={handleCheckout}
                disabled={processing || couponState === 'checking'}
                className="w-full min-h-[48px] text-base"
              >
                {processing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing…</>
                ) : (
                  <><CreditCard className="h-4 w-4 mr-2" /> Pay {filsToAED(effectiveAmount)} AED</>
                )}
              </Button>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                <span>🔒 Secure checkout</span>
                <span>↩️ Cancel anytime</span>
                <span>🛡️ Data encrypted</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card className="mt-8 max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-base">What you get</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {[
                ['Unlimited ATS-optimized resume downloads', '✅'],
                ['Unlimited cover letter downloads', '✅'],
                ['Full AI-powered career features', '✅'],
                ['Interview prep for UAE jobs', '✅'],
                ['Priority support', '✅'],
              ].map(([item, icon]) => (
                <li key={item} className="flex items-start gap-2">
                  <span>{icon}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
