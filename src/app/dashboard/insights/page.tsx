'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Memory, Status } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Sparkles, Camera, BookHeart, TrendingUp, ChevronLeft, ChevronRight, CalendarDays, Smile, Zap } from 'lucide-react'

export default function InsightsPage() {
  const { user } = useAuth()
  const [memories, setMemories] = useState<Memory[]>([])
  const [allMemories, setAllMemories] = useState<Memory[]>([])
  const [statusHistory, setStatusHistory] = useState<Status[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user, month, year])

  const loadData = async () => {
    if (!user) return
    setLoading(true)

    const startOfMonth = new Date(year, month, 1).toISOString()
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

    const [memoriesRes, allMemoriesRes, statusRes] = await Promise.all([
      supabase.from('memories').select('*').gte('created_at', startOfMonth).lte('created_at', endOfMonth).order('created_at', { ascending: false }),
      supabase.from('memories').select('*').order('created_at', { ascending: false }),
      supabase.from('statuses').select('*').eq('user_id', user.id).single(),
    ])

    if (memoriesRes.data) setMemories(memoriesRes.data)
    if (allMemoriesRes.data) setAllMemories(allMemoriesRes.data)
    if (statusRes.data) setStatusHistory([statusRes.data])
    setLoading(false)
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const navigateMonth = (delta: number) => {
    const newMonth = month + delta
    if (newMonth < 0) { setMonth(11); setYear(year - 1) }
    else if (newMonth > 11) { setMonth(0); setYear(year + 1) }
    else setMonth(newMonth)
  }

  const isCurrentMonth = month === new Date().getMonth() && year === new Date().getFullYear()
  const memoryCount = memories.length
  const photoCount = memories.filter((m) => m.image_url).length
  const longMemories = memories.filter((m) => m.content.length > 80).length

  const emotionalCounts: Record<string, number> = {}
  if (statusHistory[0]?.emotional_status) {
    emotionalCounts[statusHistory[0].emotional_status] = 1
  }

  const currentStatus = statusHistory[0]
  const daysSinceFirst = allMemories.length > 0
    ? Math.floor((Date.now() - new Date(allMemories[allMemories.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const recentMemory = memories[0]

  const emotionalTrend = currentStatus?.emotional_status || null

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center shadow-sm">
          <TrendingUp className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Monthly Insights</h1>
          <p className="text-sm text-gray-400">Celebrating your connection</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 bg-white rounded-2xl border border-border/50 p-3 shadow-sm">
        <button onClick={() => navigateMonth(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-gray-700 min-w-[180px] text-center">
          {monthNames[month]} {year}
          {isCurrentMonth && <span className="ml-2 text-xs text-rose-400 font-normal">(Current)</span>}
        </h2>
        <button onClick={() => navigateMonth(1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse-soft">
          <div className="h-32 bg-white/50 rounded-2xl" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="h-24 bg-white/50 rounded-2xl" />
            <div className="h-24 bg-white/50 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-rose-50 to-purple-50 border-rose-100/50 overflow-hidden">
            <CardContent className="pt-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-200 to-purple-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Sparkles className="w-7 h-7 text-rose-500" />
              </div>
              <p className="text-4xl font-bold text-gray-800">{memoryCount}</p>
              <p className="text-sm text-gray-500 mt-1">memories shared {isCurrentMonth ? 'this month' : `in ${monthNames[month]}`}</p>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <BookHeart className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{longMemories}</p>
                    <p className="text-xs text-gray-500">heartfelt moments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{photoCount}</p>
                    <p className="text-xs text-gray-500">photos captured</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{daysSinceFirst > 0 ? daysSinceFirst : 'New'}</p>
                    <p className="text-xs text-gray-500">days together</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Smile className="w-3 h-3 text-purple-400" />
                  Current Vibe
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emotionalTrend ? (
                  <div className="text-center py-2">
                    <span className="text-3xl">
                      {emotionalTrend === 'loving' && '🥰'}
                      {emotionalTrend === 'feeling_good' && '✨'}
                      {emotionalTrend === 'grateful' && '🙏'}
                      {emotionalTrend === 'miss_you' && '💕'}
                      {emotionalTrend === 'low_energy' && '😴'}
                      {emotionalTrend === 'need_space' && '🌿'}
                      {emotionalTrend === 'stressed' && '😰'}
                      {emotionalTrend === 'thoughtful' && '🤔'}
                    </span>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{emotionalTrend.replace(/_/g, ' ')}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">No mood set yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Status Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStatus?.reason_status ? (
                  <div className="text-center py-2">
                    <span className="text-3xl">
                      {currentStatus.reason_status === 'working' && '💼'}
                      {currentStatus.reason_status === 'busy' && '⚡'}
                      {currentStatus.reason_status === 'traveling' && '🚗'}
                      {currentStatus.reason_status === 'resting' && '😌'}
                      {currentStatus.reason_status === 'meeting' && '📋'}
                      {currentStatus.reason_status === 'focusing' && '🎯'}
                      {currentStatus.reason_status === 'commuting' && '🚇'}
                      {currentStatus.reason_status === 'available' && '🙌'}
                    </span>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{currentStatus.reason_status}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">No status set</p>
                )}
              </CardContent>
            </Card>
          </div>

          {recentMemory && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-3 h-3 text-rose-400" />
                  Most recent memory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 italic leading-relaxed">
                  &ldquo;{recentMemory.content.slice(0, 150)}{recentMemory.content.length > 150 ? '...' : ''}&rdquo;
                </p>
              </CardContent>
            </Card>
          )}

          {memoryCount === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-border/50">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <BookHeart className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No memories this month</p>
              <p className="text-sm text-gray-400 mt-1">Start capturing moments together</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
