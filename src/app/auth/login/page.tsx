'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Loader2, Chrome, Smartphone } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otpMode, setOtpMode] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')

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

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({ phone })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setOtpSent(true)
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-neutral-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to your private space</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          {!otpMode ? (
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-100">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
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
                <Button type="button" variant="outline" onClick={handleGoogleLogin} disabled={loading} className="h-11">
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button type="button" variant="outline" onClick={() => setOtpMode(true)} disabled={loading} className="h-11">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Phone OTP
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-100">
                      {error}
                    </div>
                  )}
                  <Button onClick={handleSendOtp} className="w-full h-11" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {loading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-neutral-600">Enter the code sent to <strong>{phone}</strong></p>
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-100">
                      {error}
                    </div>
                  )}
                  <Button onClick={handleVerifyOtp} className="w-full h-11" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </>
              )}
              <Button type="button" variant="ghost" onClick={() => { setOtpMode(false); setOtpSent(false) }} className="w-full text-sm text-neutral-500">
                Back to email login
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Don&apos;t have a space yet?{' '}
          <Link href="/auth/register" className="text-rose-500 hover:text-rose-600 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
