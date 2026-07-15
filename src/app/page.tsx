'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Shield, Clock, ImageIcon, BarChart3, CheckCircle, ArrowRight, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Clock,
    title: 'Smart Availability',
    desc: 'Set your daily schedule so your partner knows when you\'re free — no need to text.',
  },
  {
    icon: Heart,
    title: 'Emotional Check-ins',
    desc: 'Share how you\'re feeling with one tap. Stay connected even on busy days.',
  },
  {
    icon: ImageIcon,
    title: 'Private Memories',
    desc: 'A shared timeline of moments that matter. Text and photos, just for the two of you.',
  },
  {
    icon: BarChart3,
    title: 'Monthly Insights',
    desc: 'Beautifully simple patterns that celebrate your connection without judgment.',
  },
]

const benefits = [
  'No likes, comments, or followers',
  'No public profiles or feeds',
  'Not a dating app or monitoring tool',
  '100% private — just you and your partner',
]

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-semibold text-base text-neutral-900">Stay Connected</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className={`pt-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#fef2f2_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#f5f5f5_0%,_transparent_50%)]" />
          <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 text-sm mb-8 animate-fade-in">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Private — Just for you and your partner</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-neutral-900 text-balance">
              A platform to{' '}
              <span className="text-rose-500">
                stay connected
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              A private space for couples to share availability, emotions, and memories — without the noise of social media. Stay connected every moment.
            </p>

            <div className="flex items-center justify-center gap-3">
              <Link href="/auth/register">
                <Button size="lg" className="shadow-lg shadow-rose-200/30">
                  Start Your Private Space
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">Everything you need, nothing you don&apos;t</h2>
            <p className="text-neutral-500 mt-3 text-lg">Simple tools built for real couples</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-gray-100 bg-white p-7 hover:border-gray-200 hover:shadow-card-hover transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center mb-5 group-hover:bg-rose-50 transition-colors duration-300">
                  <f.icon className="w-5 h-5 text-neutral-600 group-hover:text-rose-500 transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-24">
          <div className="rounded-3xl bg-neutral-50 border border-neutral-100 p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 text-center mb-10">
              Designed for real relationships
            </h2>
            <div className="grid sm:grid-cols-2 gap-5 max-w-xl mx-auto">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span className="text-sm text-neutral-600">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-rose-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Ready to create your private space?
          </h2>
          <p className="text-neutral-500 text-lg mb-10 max-w-md mx-auto">
            Two accounts. One private space. A lifetime of connection.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="shadow-lg shadow-rose-200/30">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </section>

        <footer className="max-w-6xl mx-auto px-6 py-12 text-center text-sm text-neutral-400 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-neutral-300" />
            <span className="text-neutral-500">Stay Connected</span>
          </div>
          <p>A platform to stay connected. End-to-end encrypted.</p>
        </footer>
      </main>
    </div>
  )
}
