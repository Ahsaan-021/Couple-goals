'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Schedule } from '@/types'
import { Plus, X, Clock, Check, Loader2 } from 'lucide-react'

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface ScheduleManagerProps {
  schedules: Schedule[]
  onSchedulesChange: (schedules: Schedule[]) => void
}

export default function ScheduleManager({ schedules, onSchedulesChange }: ScheduleManagerProps) {
  const { user } = useAuth()
  const [saving, setSaving] = useState<string | null>(null)
  const [dirtySlots, setDirtySlots] = useState<Set<string>>(new Set())

  const grouped: Record<number, Schedule[]> = {}
  for (let i = 0; i < 7; i++) grouped[i] = []
  schedules.forEach((s) => {
    if (grouped[s.day_of_week]) grouped[s.day_of_week].push(s)
  })

  const addSlot = async (day: number) => {
    if (!user) return
    setSaving(`add-${day}`)
    const { data } = await supabase
      .from('schedules')
      .insert({ user_id: user.id, day_of_week: day, start_time: '09:00', end_time: '17:00', is_busy: true, label: '' })
      .select()
      .single()

    if (data) onSchedulesChange([...schedules, data])
    setSaving(null)
  }

  const removeSlot = async (id: string) => {
    setSaving(`remove-${id}`)
    await supabase.from('schedules').delete().eq('id', id)
    onSchedulesChange(schedules.filter((s) => s.id !== id))
    setSaving(null)
  }

  const markDirty = (id: string) => {
    setDirtySlots((prev) => new Set(prev).add(id))
  }

  const saveSlot = async (id: string) => {
    const slot = schedules.find((s) => s.id === id)
    if (!slot) return
    setSaving(`save-${id}`)
    const { data } = await supabase
      .from('schedules')
      .update({ start_time: slot.start_time, end_time: slot.end_time, label: slot.label } as any)
      .eq('id', id)
      .select()
      .single()
    if (data) {
      onSchedulesChange(schedules.map((s) => (s.id === id ? data : s)))
      setDirtySlots((prev) => { const n = new Set(prev); n.delete(id); return n })
    }
    setSaving(null)
  }

  const updateLocal = (id: string, field: string, value: string) => {
    onSchedulesChange(schedules.map((s) => s.id === id ? { ...s, [field]: value } as any : s))
    markDirty(id)
  }

  const today = new Date().getDay()

  return (
    <div className="space-y-0">
      {dayNames.map((day, i) => {
        const slots = grouped[i] || []
        const isToday = i === today
        return (
          <div key={i} className={`py-3 px-1 border-b border-gray-100 last:border-0 ${isToday ? 'bg-rose-50/30 -mx-1 px-3 rounded-lg' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-10 text-xs font-semibold ${isToday ? 'text-rose-600' : 'text-neutral-500'}`}>
                {day}
                {isToday && <span className="block text-[10px] font-normal text-rose-400">today</span>}
              </div>
              <div className="flex-1" />
              <button
                onClick={() => addSlot(i)}
                disabled={saving === `add-${day}`}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-rose-500 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add block
              </button>
            </div>

            {slots.length === 0 && (
              <div className="ml-12 text-sm text-neutral-300 italic">Free all day</div>
            )}

            <div className="ml-12 space-y-2">
              {slots.map((slot) => {
                const isDirty = dirtySlots.has(slot.id)
                const isSaving = saving === `save-${slot.id}`
                return (
                  <div key={slot.id} className="flex items-center gap-2 group">
                    <div className="w-2 h-2 rounded-full bg-rose-300 shrink-0" />
                    <input
                      type="time"
                      value={slot.start_time?.slice(0, 5) || '09:00'}
                      onChange={(e) => updateLocal(slot.id, 'start_time', e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white w-24 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent"
                    />
                    <span className="text-xs text-neutral-400">to</span>
                    <input
                      type="time"
                      value={slot.end_time?.slice(0, 5) || '17:00'}
                      onChange={(e) => updateLocal(slot.id, 'end_time', e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white w-24 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={slot.label || ''}
                      onChange={(e) => updateLocal(slot.id, 'label', e.target.value)}
                      placeholder="What?"
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white flex-1 min-w-0 text-neutral-600 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent"
                      maxLength={30}
                    />
                    {isDirty && (
                      <button
                        onClick={() => saveSlot(slot.id)}
                        disabled={isSaving}
                        className="text-emerald-500 hover:text-emerald-600 transition-colors"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button
                      onClick={() => removeSlot(slot.id)}
                      disabled={saving === `remove-${slot.id}`}
                      className="text-neutral-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      <p className="text-xs text-neutral-400 pt-3 text-center">
        <Clock className="w-3 h-3 inline mr-1" />
        Add time blocks for when you&apos;re busy. Click <Check className="w-3 h-3 inline text-emerald-500" /> to save changes.
      </p>
    </div>
  )
}
