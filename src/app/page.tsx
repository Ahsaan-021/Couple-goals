'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Shield, Clock, ImageIcon, BarChart3, CheckCircle, ArrowRight, MessageCircle, Sparkles, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

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
    icon: MapPin,
    title: 'Live Location',
    desc: 'Share your real-time location. See when your partner is on the way home.',
  },
  {
    icon: MessageCircle,
    title: 'Private Chat',
    desc: 'End-to-end encrypted messaging with photos, videos, and one-time view media.',
  },
  {
    icon: BarChart3,
    title: 'Monthly Insights',
    desc: 'Beautiful patterns that celebrate your connection. Birthday countdowns and more.',
  },
]

const benefits = [
  'No likes, comments, or followers',
  'No public profiles or feeds',
  'Not a dating app or monitoring tool',
  '100% private — just you and your partner',
  'End-to-end encrypted messages',
  'Available on all your devices',
]

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-72 h-[520px] rounded-[2.5rem] border-4 border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden shrink-0">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-2xl z-10" />
      <div className="h-full w-full bg-gradient-to-b from-rose-50 to-white p-5 pt-10 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

function SectionHeading({ label, title, desc }: { label: string; title: string; desc: string }) {
  return (
    <div className="max-w-xl">
      <span className="text-xs font-semibold tracking-widest text-rose-500 uppercase">{label}</span>
      <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mt-3 mb-4">{title}</h2>
      <p className="text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">{desc}</p>
    </div>
  )
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    setMounted(true)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setAuthUser(data.session.user)
        supabase.from('profiles').select('name').eq('id', data.session.user.id).single().then(({ data: p }) => {
          if (p?.name) setUserName(p.name)
        })
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="white" />
            </div>
            <span className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 hidden sm:inline">Stay Connected</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle />
            {authUser ? (
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4">
                  <Heart className="w-3.5 h-3.5" fill="currentColor" />
                  <span className="hidden sm:inline">{userName || 'Dashboard'}</span>
                  <span className="sm:hidden">Dashboard</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={`pt-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#fef2f2_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#f5f5f5_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,_#1a0a0a_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#0a0a0a_0%,_transparent_50%)]" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-sm mb-8 animate-fade-in">
                  <Shield className="w-3.5 h-3.5" />
                  <span>100% Private — Just for you and your partner</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-neutral-900 dark:text-neutral-100 text-balance">
                  A platform to{' '}
                  <span className="text-rose-500">
                    stay connected
                  </span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-neutral-500 dark:text-neutral-400 max-w-xl mb-8 sm:mb-10 leading-relaxed">
                  A private space for couples to share availability, emotions, memories, and location — without the noise of social media.
                </p>

                <div className="flex items-center gap-3">
                  <Link href="/auth/register">
                    <Button size="lg" className="shadow-lg shadow-rose-200/30 text-sm sm:text-base px-4 sm:px-6">
                      Start Your Private Space
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="outline" size="lg" className="text-sm sm:text-base px-4 sm:px-6">Sign In</Button>
                  </Link>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <PhoneFrame>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white" fill="white" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-800">Stay Connected</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700">P</div>
                    <div className="flex-1">
                      <p className="text-[10px] font-medium text-neutral-800">Partner</p>
                      <p className="text-[8px] text-emerald-500">Online</p>
                    </div>
                    <span className="text-[9px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">now</span>
                  </div>
                  <div className="flex gap-1.5 mb-3">
                    <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full">Working</span>
                    <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 rounded-full">Loving</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mb-4 italic">&ldquo;Finishing up, can&apos;t wait to see you!&rdquo;</p>
                  <div className="bg-rose-500 text-white rounded-2xl rounded-tr-sm p-3 ml-8 mb-4">
                    <p className="text-[11px]">Miss you too! ❤️</p>
                    <p className="text-[8px] text-white/60 text-right mt-1">12:30</p>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <div className="flex items-center gap-1 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span className="text-[9px] font-medium text-neutral-600">Your mood today</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {['😊', '😌', '😍', '😤', '😴', '🥰'].map((e, i) => (
                        <span key={i} className="text-sm w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-100 shadow-sm">{e}</span>
                      ))}
                    </div>
                  </div>
                </PhoneFrame>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100">Everything you need, nothing you don&apos;t</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-lg">Simple tools built for real couples</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-7 hover:border-gray-200 dark:hover:border-neutral-700 hover:shadow-card-hover dark:shadow-none transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-5 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/30 transition-colors duration-300">
                  <f.icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-gray-100 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="flex items-center justify-center lg:justify-start order-2 lg:order-1">
                <PhoneFrame>
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-xs font-semibold text-neutral-800 flex-1">Set your availability</span>
                    <span className="text-[9px] text-rose-500 font-medium">Edit</span>
                  </div>
                  <div className="space-y-2.5 mb-5">
                    {[
                      { day: 'Mon', times: '9:00 AM — 6:00 PM', busy: false },
                      { day: 'Tue', times: '9:00 AM — 6:00 PM', busy: false },
                      { day: 'Wed', times: '9:00 AM — 6:00 PM', busy: false },
                      { day: 'Thu', times: '9:00 AM — 6:00 PM', busy: false },
                      { day: 'Fri', times: '9:00 AM — 4:00 PM', busy: false },
                      { day: 'Sat', times: '—', busy: true },
                      { day: 'Sun', times: '—', busy: true },
                    ].map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-8 text-[10px] font-medium text-neutral-500">{d.day}</span>
                        <div className={`flex-1 h-5 rounded-md ${d.busy ? 'bg-rose-100' : 'bg-emerald-100'} flex items-center px-2`}>
                          <span className={`text-[9px] ${d.busy ? 'text-rose-500 italic' : 'text-emerald-700'}`}>
                            {d.busy ? 'Off' : d.times}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-[10px] font-medium text-neutral-600 mb-2">Current Status</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { emoji: '💼', label: 'Working' },
                        { emoji: '❤️', label: 'Loving' },
                        { emoji: '😴', label: 'Sleepy' },
                        { emoji: '🏋️', label: 'Gym' },
                      ].map((s, i) => (
                        <div key={i} className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg ${i === 0 ? 'bg-rose-100 border border-rose-200' : 'bg-white border border-gray-100'}`}>
                          <span className="text-sm">{s.emoji}</span>
                          <span className="text-[7px] text-neutral-500">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </PhoneFrame>
              </div>
              <div className="order-1 lg:order-2">
                <SectionHeading
                  label="Feature"
                  title="Smart Availability"
                  desc="Set your work hours, free time, and sleeping schedule so your partner always knows when you're available — without needing to ask."
                />
                <ul className="mt-8 space-y-3">
                  {[
                    'Daily & weekly schedule templates',
                    'Real-time status updates with emojis',
                    'Auto-availability based on your calendar',
                    'Partner gets notified when you\'re free',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/30 border-t border-gray-100 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <SectionHeading
                  label="Feature"
                  title="Private Chat"
                  desc="End-to-end encrypted conversations with your partner. Share messages, photos, videos, and voice notes in complete privacy."
                />
                <ul className="mt-8 space-y-3">
                  {[
                    'End-to-end encrypted messages',
                    'Send photos, videos & voice notes',
                    'One-time view for private media',
                    'Real-time delivery & read receipts',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center lg:justify-end">
                <PhoneFrame>
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-200 mb-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[9px] font-medium text-emerald-700">P</div>
                    <div className="flex-1">
                      <p className="text-[10px] font-medium text-neutral-800">Partner</p>
                      <p className="text-[7px] text-emerald-500">Online</p>
                    </div>
                    <span className="text-[9px] text-neutral-400">Today</span>
                  </div>
                  <div className="space-y-2.5 mb-3">
                    <div className="bg-rose-500 text-white rounded-2xl rounded-tr-sm p-2.5 ml-8 max-w-[80%]">
                      <p className="text-[10px]">Hey! How&apos;s your day going? ❤️</p>
                      <p className="text-[7px] text-white/60 text-right mt-1">10:30 AM</p>
                    </div>
                    <div className="bg-neutral-100 rounded-2xl rounded-tl-sm p-2.5 mr-8 max-w-[80%]">
                      <p className="text-[10px] text-neutral-800">Going great! Just wrapped up that meeting. Miss you! 🥰</p>
                      <p className="text-[7px] text-neutral-400 text-right mt-1">10:32 AM</p>
                    </div>
                    <div className="bg-rose-500 text-white rounded-2xl rounded-tr-sm p-2.5 ml-8 max-w-[80%]">
                      <p className="text-[10px]">Proud of you! Can&apos;t wait to see you tonight 💕</p>
                      <p className="text-[7px] text-white/60 text-right mt-1">10:33 AM</p>
                    </div>
                    <div className="flex items-center gap-2 ml-8">
                      <div className="bg-neutral-100 rounded-xl p-1.5">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-rose-200 to-pink-100 flex items-center justify-center text-lg">🌅</div>
                      </div>
                      <div className="bg-neutral-100 rounded-xl p-1.5">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-200 to-sky-100 flex items-center justify-center text-lg">🐱</div>
                      </div>
                    </div>
                    <p className="text-[7px] text-neutral-400 ml-8">10:35 AM</p>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex items-center gap-2">
                    <div className="flex-1 h-7 rounded-full bg-neutral-100 border border-gray-200 px-3 flex items-center">
                      <span className="text-[9px] text-neutral-400">Type a message...</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </PhoneFrame>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-gray-100 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="flex items-center justify-center lg:justify-start order-2 lg:order-1">
                <PhoneFrame>
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs font-semibold text-neutral-800 flex-1">Our Memories</span>
                    <span className="text-[9px] text-rose-500">+ Add</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium text-neutral-800">Our First Dinner</span>
                        <span className="text-[8px] text-neutral-400 ml-auto">Mar 15</span>
                      </div>
                      <div className="w-full h-20 rounded-lg bg-gradient-to-br from-rose-100 to-pink-50 flex items-center justify-center mb-2">
                        <span className="text-2xl">🍝</span>
                      </div>
                      <p className="text-[9px] text-neutral-500">The best pasta and even better company. Let&apos;s go again soon! ❤️</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium text-neutral-800">Weekend Getaway</span>
                        <span className="text-[8px] text-neutral-400 ml-auto">Mar 10</span>
                      </div>
                      <div className="flex gap-1.5 mb-2">
                        <div className="flex-1 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-sky-50 flex items-center justify-center text-lg">🏔️</div>
                        <div className="flex-1 h-12 rounded-lg bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center text-lg">🌲</div>
                      </div>
                      <p className="text-[9px] text-neutral-500">Mountains, coffee, and endless conversations. Perfect weekend. ✨</p>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-3 border border-dashed border-gray-200 flex items-center justify-center gap-2">
                      <span className="text-lg">💫</span>
                      <span className="text-[10px] text-neutral-400">Add a new memory...</span>
                    </div>
                  </div>
                </PhoneFrame>
              </div>
              <div className="order-1 lg:order-2">
                <SectionHeading
                  label="Feature"
                  title="Private Memories"
                  desc="A shared timeline of your journey together. Capture moments, upload photos, and write notes that only the two of you can see."
                />
                <ul className="mt-8 space-y-3">
                  {[
                    'Shared photo & video timeline',
                    'Write private notes for each moment',
                    'Add memories from any date',
                    'Beautiful grid & timeline views',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/30 border-t border-gray-100 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <SectionHeading
                  label="Feature"
                  title="Live Location"
                  desc="Share your real-time location with your partner. Know when they're on their way, stuck in traffic, or nearby."
                />
                <ul className="mt-8 space-y-3">
                  {[
                    'Real-time location sharing',
                    'See partner on an interactive map',
                    'One-tap share / stop sharing',
                    'Distance calculation & ETA',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center lg:justify-end">
                <PhoneFrame>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs font-semibold text-neutral-800 flex-1">Live Location</span>
                    <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Sharing</span>
                  </div>
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-emerald-100 via-teal-50 to-blue-100 mb-3 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px)'}} />
                    <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-lg absolute" style={{top: '30%', left: '40%'}} />
                    <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg absolute" style={{top: '55%', left: '65%'}} />
                    <div className="w-2 h-2 rounded-full bg-rose-400 animate-ping absolute" style={{top: '30%', left: '40%'}} />
                    <div className="text-[8px] text-neutral-400 font-medium">📍 Map View</div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 bg-rose-50 rounded-xl p-2 border border-rose-100">
                      <p className="text-[8px] text-rose-500">You</p>
                      <p className="text-[9px] text-neutral-600">Home</p>
                      <p className="text-[7px] text-neutral-400">2 min ago</p>
                    </div>
                    <div className="flex-1 bg-emerald-50 rounded-xl p-2 border border-emerald-100">
                      <p className="text-[8px] text-emerald-500">Partner</p>
                      <p className="text-[9px] text-neutral-600">Office</p>
                      <p className="text-[7px] text-neutral-400">1 min ago</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] text-neutral-600">Distance</p>
                      <p className="text-[11px] font-medium text-neutral-800">3.2 km away</p>
                    </div>
                    <span className="text-[8px] text-neutral-400">~12 min</span>
                  </div>
                </PhoneFrame>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-gray-100 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="flex items-center justify-center lg:justify-start order-2 lg:order-1">
                <PhoneFrame>
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs font-semibold text-neutral-800 flex-1">Monthly Insights</span>
                    <span className="text-[8px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">March</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-medium text-neutral-600">Connection Streak</p>
                      <span className="text-[10px] font-bold text-rose-500">24 days</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className={`flex-1 h-3 rounded-sm ${i < 24 ? (i % 2 === 0 ? 'bg-rose-300' : 'bg-rose-400') : 'bg-neutral-100'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                      <p className="text-[8px] text-neutral-400">Messages</p>
                      <p className="text-lg font-bold text-neutral-800">847</p>
                      <p className="text-[7px] text-emerald-500">↑ 12% vs last month</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                      <p className="text-[8px] text-neutral-400">Memories</p>
                      <p className="text-lg font-bold text-neutral-800">12</p>
                      <p className="text-[7px] text-emerald-500">↑ 3 new this week</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <p className="text-[9px] font-medium text-neutral-600 mb-2">Mood Check-ins</p>
                    <div className="flex gap-1.5 items-end h-16">
                      {[40, 65, 80, 55, 90, 70, 85].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <div className="w-full rounded-sm bg-gradient-to-t from-rose-200 to-rose-400" style={{ height: `${h}%` }} />
                          <span className="text-[7px] text-neutral-400">{['M','T','W','T','F','S','S'][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </PhoneFrame>
              </div>
              <div className="order-1 lg:order-2">
                <SectionHeading
                  label="Feature"
                  title="Monthly Insights"
                  desc="Beautiful visual summaries of your connection. See patterns, track streaks, and celebrate your journey together with meaningful data."
                />
                <ul className="mt-8 space-y-3">
                  {[
                    'Message & memory frequency trends',
                    'Mood check-in patterns over time',
                    'Connection streak tracking',
                    'Birthday & anniversary countdowns',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-24">
          <div className="rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-10">
              Designed for real relationships
            </h2>
            <div className="grid sm:grid-cols-2 gap-5 max-w-xl mx-auto">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-24 text-center border-t border-gray-100 dark:border-neutral-800">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-rose-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Ready to create your private space?
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-10 max-w-md mx-auto">
            Two accounts. One private space. A lifetime of connection.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="shadow-lg shadow-rose-200/30 text-sm sm:text-base px-5 sm:px-6">
              Get Started Free
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
            </Button>
          </Link>
        </section>

        <Footer />
      </main>
    </div>
  )
}
