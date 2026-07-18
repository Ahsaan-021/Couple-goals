'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Memory } from '@/types'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Flame, CalendarDays, BookHeart, Camera, Heart } from 'lucide-react'

export default function StreakPage() {
  const { user, profile } = useAuth()
  const [daysTogether, setDaysTogether] = useState(0)
  const [totalMemories, setTotalMemories] = useState(0)
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const active = data.filter((m: Memory) => !m.deleted_at)
          setTotalMemories(active.length)
          setTotalPhotos(active.filter((m: Memory) => m.media_type === 'image').length)
          if (active.length > 0) {
            const last = active[active.length - 1]
            const days = Math.floor((Date.now() - new Date(last.created_at).getTime()) / (1000 * 60 * 60 * 24))
            setDaysTogether(days)
          }
        }
        setLoading(false)
      })
  }, [user])

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Streak</h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">Your journey together</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse-soft">
          <div className="h-48 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-50 dark:border-neutral-800" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="h-24 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-50 dark:border-neutral-800" />
            <div className="h-24 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-50 dark:border-neutral-800" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-100/50 dark:border-orange-900/50 overflow-hidden">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mx-auto mb-4">
                <Flame className="w-10 h-10 text-orange-500" />
              </div>
              <p className="text-5xl font-bold text-neutral-900 dark:text-neutral-100">{daysTogether}</p>
              <p className="text-base text-neutral-500 dark:text-neutral-400 mt-2">days together</p>
              <div className="flex items-center justify-center gap-1 mt-3">
                {Array.from({ length: Math.min(daysTogether, 7) }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < 7 ? 'bg-orange-400' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/dashboard/memories">
              <Card className="cursor-pointer hover:shadow-card-hover transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                      <BookHeart className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{totalMemories}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">memories shared</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/memories">
              <Card className="cursor-pointer hover:shadow-card-hover transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{totalPhotos}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">photos captured</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
