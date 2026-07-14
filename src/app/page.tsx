'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Shield, Clock, ImageIcon, BarChart3, CheckCircle, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f0] via-white to-[#fef6f5]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <span className="font-semibold text-lg text-gray-800">Couple Goals</span>
          </Link>
          <div className="flex items-center gap-2">
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
        <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/50 text-rose-600 text-sm mb-8 animate-fade-in">
            <Shield className="w-3.5 h-3.5" />
            <span>100% Private — Just for you and your partner</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-800">
            Stay emotionally connected,{' '}
            <span className="bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
              even on busy days
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            A private space for committed couples to share availability, emotions, and memories — without the noise of social media.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link href="/auth/register">
              <Button size="lg" className="shadow-lg shadow-rose-200/50">
                Start Your Private Space
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Everything you need, nothing you don&apos;t</h2>
            <p className="text-gray-500 mt-2">Simple tools built for real couples</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-border/50 bg-white/80 p-6 backdrop-blur-sm hover:shadow-lg hover:border-rose-100 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="rounded-3xl bg-gradient-to-br from-rose-50 to-purple-50 border border-rose-100 p-10 md:p-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
              Designed for real relationships
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span className="text-sm text-gray-600">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Ready to create your private space?
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Two accounts. One private space. A lifetime of connection.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="shadow-lg shadow-rose-200/50">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </section>

        <footer className="max-w-5xl mx-auto px-6 py-10 text-center text-sm text-gray-400 border-t border-border/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-rose-300" />
            <span>Couple Goals</span>
          </div>
          <p>A private space for two.</p>
        </footer>
      </main>
    </div>
  )
}
