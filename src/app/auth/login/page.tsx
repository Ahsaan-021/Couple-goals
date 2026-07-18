'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [resetEmail, setResetEmail] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')

  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) router.push('/dashboard')
      })
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError('')
    setResetLoading(true)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://couple-goals-omega.vercel.app'
    const { error: err } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${siteUrl}/auth/callback`,
    })

    if (err) {
      setResetError(err.message)
      setResetLoading(false)
      return
    }

    setResetSent(true)
    setResetLoading(false)
  }

  if (showReset) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-neutral-950">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-neutral-600 dark:text-neutral-300" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Reset password</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {resetSent ? 'Check your email for the reset link' : 'Enter your email to get a reset link'}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-6">
            {resetSent ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto">
                  <ArrowLeft className="w-6 h-6 text-emerald-500 rotate-45" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  We sent a reset link to <strong className="text-neutral-700 dark:text-neutral-300">{resetEmail}</strong>
                </p>
                <Button variant="outline" className="w-full" onClick={() => { setShowReset(false); setResetSent(false) }}>
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                {resetError && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-xl p-3 border border-red-100 dark:border-red-900">
                    {resetError}
                  </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={resetLoading}>
                  {resetLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  Back to Sign In
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-neutral-950">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-neutral-600 dark:text-neutral-300" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Welcome back</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Sign in to your private space</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-xl p-3 border border-red-100 dark:border-red-900">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          Don&apos;t have a space yet?{' '}
          <Link href="/auth/register" className="text-rose-500 hover:text-rose-600 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
