'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Status, Schedule, PartnerStatus, Profile } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusSelector from '@/components/StatusSelector'
import ScheduleManager from '@/components/ScheduleManager'
import PartnerCard from '@/components/PartnerCard'
import Link from 'next/link'
import { Heart, MessageCircle, Sparkles, Clock, ChevronRight, StickyNote, Check, Loader2, Edit3 } from 'lucide-react'

function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse-soft">
      <div className="h-8 w-48 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
      <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
      <div className="h-32 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-50 dark:border-neutral-800" />
      <div className="h-48 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-50 dark:border-neutral-800" />
      <div className="h-64 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-50 dark:border-neutral-800" />
    </div>
  )
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [status, setStatus] = useState<Status | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [partner, setPartner] = useState<PartnerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [noteContent, setNoteContent] = useState('')
  const [noteId, setNoteId] = useState<string | null>(null)
  const [noteLoading, setNoteLoading] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  const [noteDirty, setNoteDirty] = useState(false)

  const partnerPhone = process.env.NEXT_PUBLIC_PARTNER_PHONE

  const loadPartner = async (partnerId: string) => {
    const { data: partnerData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerId)
      .single()

    if (partnerData) {
      const { data: partnerStatus } = await supabase
        .from('statuses')
        .select('*')
        .eq('user_id', partnerData.id)
        .maybeSingle()

        setPartner({
          profile: partnerData as Profile,
        status: partnerStatus,
        is_online: false,
      })
    } else {
      setPartner(null)
    }
  }

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const [statusRes, scheduleRes, profileRes, noteRes] = await Promise.all([
        supabase.from('statuses').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('schedules').select('*').eq('user_id', user.id).order('day_of_week'),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('notes').select('*').eq('user_id', user.id).maybeSingle(),
      ])

      if (statusRes.data) setStatus(statusRes.data)
      if (scheduleRes.data) setSchedules(scheduleRes.data)
      if (noteRes.data) { setNoteContent(noteRes.data.content); setNoteId(noteRes.data.id) }

      const myProfile = profileRes.data
      if (myProfile?.partner_id) {
        await loadPartner(myProfile.partner_id)
      }
      setNoteLoading(false)
      setLoading(false)
    })()
  }, [user])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'statuses', filter: `user_id=eq.${user.id}` }, (payload) => {
        setStatus(payload.new as Status)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'statuses' }, (payload) => {
        const s = payload.new as Status
        setPartner((prev) => {
          if (!prev || s.user_id !== prev.profile.id) return prev
          return { ...prev, status: s }
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
        const p = payload.new as any
        if (p.partner_id) loadPartner(p.partner_id)
        else setPartner(null)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const handleStatusUpdate = async (reasonStatus?: string, emotionalStatus?: string, customReason?: string) => {
    if (!user) return
    const updates: any = { user_id: user.id, updated_at: new Date().toISOString() }
    if (reasonStatus) updates.reason_status = reasonStatus
    if (emotionalStatus) updates.emotional_status = emotionalStatus
    if (customReason !== undefined) updates.custom_reason = customReason
    const { data } = await supabase.from('statuses').upsert(updates, { onConflict: 'user_id' }).select().single()
    if (data) setStatus(data)
  }

  const saveNote = async () => {
    if (!user || !noteContent.trim()) return
    setSavingNote(true)
    if (noteId) {
      await supabase.from('notes').update({ content: noteContent.trim(), updated_at: new Date().toISOString() }).eq('id', noteId)
    } else {
      const { data } = await supabase.from('notes').insert({ user_id: user.id, content: noteContent.trim() }).select().single()
      if (data) setNoteId(data.id)
    }
    setSavingNote(false)
    setNoteSaved(true)
    setNoteDirty(false)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const openWhatsApp = () => {
    if (partnerPhone) window.open(`https://wa.me/${partnerPhone}`, '_blank')
  }

  if (loading) return <DashboardSkeleton />

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
            Hello, {profile?.name?.split(' ')[0] || 'there'}
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">{today}</p>
        </div>
        {partnerPhone && (
          <Button variant="outline" size="sm" onClick={openWhatsApp} className="shrink-0">
            <MessageCircle className="w-4 h-4 mr-1.5 text-emerald-500" />
            Send to Partner
          </Button>
        )}
      </div>

      {!profile?.partner_id && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300 flex-1">
            Connect with your partner to share status and memories.
          </p>
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm" className="shrink-0 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30">
              Settings
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {partner && (
        <div className="animate-scale-in">
          <PartnerCard partner={partner} />
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <span className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
              </span>
              How are you feeling?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusSelector
              currentReason={status?.reason_status}
              currentEmotional={status?.emotional_status}
              currentCustomReason={status?.custom_reason}
              onUpdate={handleStatusUpdate}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <span className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                <StickyNote className="w-3.5 h-3.5 text-rose-500" />
              </span>
              Personal Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <textarea
                value={noteContent}
                onChange={(e) => { setNoteContent(e.target.value); setNoteDirty(true); setNoteSaved(false) }}
                placeholder="Write a quick note for yourself..."
                className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-neutral-100 px-4 py-3 text-sm outline-none focus:border-rose-200 dark:focus:border-rose-700 focus:ring-1 focus:ring-rose-200 dark:focus:ring-rose-900/30 transition-all resize-none h-24 dark:placeholder:text-neutral-500"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-400 dark:text-neutral-500">{noteContent.length}/500</p>
                <Button
                  size="sm"
                  onClick={saveNote}
                  disabled={savingNote || !noteContent.trim() || !noteDirty}
                  className="transition-all"
                >
                  {savingNote ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : noteSaved ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span className="ml-1.5">{noteSaved ? 'Saved' : 'Save Note'}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <span className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
            </span>
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleManager schedules={schedules} onSchedulesChange={setSchedules} />
        </CardContent>
      </Card>
    </div>
  )
}
