'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Loader2, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://couple-goals-omega.vercel.app'
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/dashboard')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-neutral-950">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Check your email</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            We sent a confirmation link to <strong className="text-neutral-700 dark:text-neutral-300">{email}</strong>
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">Please confirm your email before signing in.</p>
          <Link href="/auth/login">
            <Button variant="outline" className="mt-6">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Sign In
            </Button>
          </Link>
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
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Create your space</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">A platform to stay connected</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-6">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
              <p className="text-xs text-neutral-400 dark:text-neutral-500">At least 6 characters</p>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-xl p-3 border border-red-100 dark:border-red-900">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Creating...' : 'Create Space'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          Already have a space?{' '}
          <Link href="/auth/login" className="text-rose-500 hover:text-rose-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
