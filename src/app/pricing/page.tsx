'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Check, X, Sparkles, ArrowRight, Zap, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import Footer from '@/components/Footer'

const plans = (yearly: boolean) => [
  {
    name: 'Free',
    price: '0',
    period: 'forever',
    description: 'For couples just getting started',
    features: [
      { included: true, text: 'Unlimited status & mood check-ins' },
      { included: true, text: 'Chat with your partner (text only)' },
      { included: true, text: 'Basic location sharing (pin)' },
      { included: false, text: 'Up to 20 memories' },
      { included: false, text: 'Memory albums & search' },
      { included: false, text: 'Full mood history & trends' },
      { included: false, text: 'Current month insights only' },
      { included: false, text: 'Anniversary & date reminders' },
      { included: false, text: 'Daily connection streaks' },
      { included: false, text: 'Shared calendar view' },
      { included: false, text: 'Priority support' },
    ],
    cta: 'Get Started Free',
    href: '/auth/register',
    popular: false,
  },
  {
    name: 'Premium',
    price: yearly ? '1,600' : '2,000',
    period: yearly ? '/mo, billed yearly' : '/month',
    description: 'Everything you need to stay deeply connected',
    features: [
      { included: true, text: 'Unlimited status & mood check-ins' },
      { included: true, text: 'Chat with photos & videos' },
      { included: true, text: 'Live location with map + ETA' },
      { included: true, text: 'Unlimited memories' },
      { included: true, text: 'Memory albums & search' },
      { included: true, text: 'Full mood history & trends' },
      { included: true, text: 'All insights —past & present' },
      { included: true, text: 'Anniversary & date reminders' },
      { included: true, text: 'Daily connection streaks' },
      { included: true, text: 'Shared calendar view' },
      { included: true, text: 'Priority support' },
    ],
    cta: yearly ? 'Start Premium (Save 20%)' : 'Start Premium',
    href: '/auth/register',
    popular: true,
  },
]

export default function PricingPage() {
  const [yearly, setYearly] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <header className="border-b border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="hidden sm:inline font-semibold text-neutral-900 dark:text-neutral-100">Stay Connected</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle />
            <Link href="/auth/login"><Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">Sign In</Button></Link>
            <Link href="/auth/register"><Button size="sm" className="text-xs sm:text-sm px-2 sm:px-4">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
            Start free. Upgrade when you&apos;re ready for deeper connection.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium ${!yearly ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}`}>Monthly</span>
          <button
            onClick={() => setYearly(!yearly)}
            className={`relative w-14 h-7 rounded-full transition-colors ${yearly ? 'bg-rose-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${yearly ? 'translate-x-7.5' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm font-medium ${yearly ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}`}>
            Yearly <span className="text-rose-500 text-xs font-semibold">Save 20%</span>
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans(yearly).map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 border-2 transition-all duration-300 ${
                plan.popular
                  ? 'bg-white dark:bg-neutral-900 border-rose-200 dark:border-rose-800 shadow-xl shadow-rose-100/30 dark:shadow-rose-950/30 scale-105 md:scale-110 relative'
                  : 'bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 shadow-card dark:shadow-none'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-sm">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{plan.name}</h2>
                <div className="mt-3 flex items-baseline gap-1">
                  {plan.price !== '0' && <span className="text-sm text-neutral-400 dark:text-neutral-500">PKR</span>}
                  <span className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">{plan.price}</span>
                  <span className="text-neutral-400 dark:text-neutral-500 text-sm">{plan.period}</span>
                </div>
                {plan.price !== '0' && yearly && (
                  <p className="text-xs text-emerald-500 mt-1 font-medium">PKR 19,200 billed yearly — save PKR 4,800</p>
                )}
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">{plan.description}</p>
              </div>

              <Link href={plan.href}>
                <Button className={`w-full h-12 text-base ${plan.popular ? '' : 'variant-outline'}`}>
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <ul className="mt-8 space-y-3.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    {f.included ? (
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-neutral-300 dark:text-neutral-600 mt-0.5 shrink-0" />
                    )}
                    <span className={f.included ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'}>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 p-8 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 rounded-3xl border border-gray-100 dark:border-neutral-800 max-w-2xl mx-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Need a custom plan?</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Contact us for team or enterprise pricing.</p>
          <Link href="/contact"><Button variant="outline" size="sm" className="mt-4">Contact Sales</Button></Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
