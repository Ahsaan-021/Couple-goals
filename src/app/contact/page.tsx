'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Mail, Send, Loader2, CheckCircle, MessageSquare } from 'lucide-react'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ThemeToggle from '@/components/ThemeToggle'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please email us directly at support@stayconnected.app.')
    }
    setSending(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Message sent!</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">We&apos;ll get back to you within 24 hours.</p>
          <Link href="/">
            <Button variant="outline" className="mt-6">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

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

      <main className="max-w-lg mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Contact Us</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">Have a question or need help? Send us a message.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-card dark:shadow-none p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Alex" className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="How can we help you?"
              rows={5}
              className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-rose-300 dark:focus:border-rose-700 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-xl p-3 border border-red-100 dark:border-red-900">
              {error}
            </div>
          )}

          <Button type="submit" disabled={sending} className="w-full h-12">
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            {sending ? 'Sending...' : 'Send Message'}
          </Button>

          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
            You can also email us directly at{' '}
            <a href="mailto:support@stayconnected.app" className="text-rose-500 hover:underline">support@stayconnected.app</a>
          </p>
        </form>
      </main>

      <Footer />
    </div>
  )
}
