'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Heart, Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash

      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (accessToken && refreshToken) {
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            setError(sessionError.message)
            return
          }

          if (session) {
            router.push('/dashboard')
            return
          }
        }
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        setError(sessionError.message)
        return
      }

      if (session) {
        router.push('/dashboard')
      } else {
        router.push('/auth/login')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-neutral-950">
      <div className="text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-7 h-7 text-neutral-600 dark:text-neutral-300" />
        </div>
        {error ? (
          <>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Something went wrong</h1>
            <p className="text-sm text-red-500">{error}</p>
          </>
        ) : (
          <>
            <Loader2 className="w-7 h-7 animate-spin text-rose-500 mx-auto mb-4" />
            <p className="text-sm text-neutral-500">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  )
}
