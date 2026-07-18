'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'

interface SubscribeButtonProps {
  priceId: string
  userId: string
  label?: string
  variant?: 'default' | 'outline'
  className?: string
}

export default function SubscribeButton({ priceId, userId, label = 'Subscribe', variant = 'default', className = '' }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.message || 'Subscription not yet configured. Set up Stripe keys to enable payments.')
      }
    } catch {
      setError('Failed to start subscription')
    }
    setLoading(false)
  }

  return (
    <div>
      <Button onClick={handleSubscribe} disabled={loading} variant={variant} className={className}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
        {loading ? 'Processing...' : label}
      </Button>
      {error && <p className="text-xs text-amber-500 mt-1">{error}</p>}
    </div>
  )
}
