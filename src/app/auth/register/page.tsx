'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebook } from 'react-icons/fa'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
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

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({ provider })
    if (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Check your email</h1>
          <p className="text-sm text-neutral-500 mt-2">
            We sent a confirmation link to <strong className="text-neutral-700">{email}</strong>
          </p>
          <p className="text-xs text-neutral-400 mt-2">Please confirm your email before signing in.</p>
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-neutral-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Create your space</h1>
          <p className="text-sm text-neutral-500 mt-1">A platform to stay connected</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
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
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
              />
              <p className="text-xs text-neutral-400">At least 6 characters</p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-100">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Creating...' : 'Create Space'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-neutral-400">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={() => handleOAuth('google')} disabled={loading} className="h-11">
                <FcGoogle className="w-5 h-5 mr-2" />
                Google
              </Button>
              <Button type="button" variant="outline" onClick={() => handleOAuth('facebook')} disabled={loading} className="h-11">
                <FaFacebook className="w-5 h-5 mr-2 text-blue-600" />
                Facebook
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have a space?{' '}
          <Link href="/auth/login" className="text-rose-500 hover:text-rose-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
