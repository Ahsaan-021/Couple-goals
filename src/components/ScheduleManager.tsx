'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Schedule } from '@/types'
import { Plus, X, Clock, Loader2, GripVertical } from 'lucide-react'

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface ScheduleManagerProps {
  schedules: Schedule[]
  onSchedulesChange: (schedules: Schedule[]) => void
}

export default function ScheduleManager({ schedules, onSchedulesChange }: ScheduleManagerProps) {
  const { user } = useAuth()
  const [saving, setSaving] = useState<string | null>(null)
  const [adding, setAdding] = useState<number | null>(null)

  const grouped: Record<number, Schedule[]> = {}
  for (let i = 0; i < 7; i++) grouped[i] = []
  schedules.forEach((s) => {
    if (grouped[s.day_of_week]) grouped[s.day_of_week].push(s)
  })

  const addSlot = async (day: number) => {
    if (!user) return
    setAdding(day)
    const { data } = await supabase
      .from('schedules')
      .insert({ user_id: user.id, day_of_week: day, start_time: '09:00', end_time: '17:00', is_busy: true, label: '' })
      .select()
      .single()
    if (data) onSchedulesChange([...schedules, data])
    setAdding(null)
  }

  const removeSlot = async (id: string) => {
    setSaving(`remove-${id}`)
    await supabase.from('schedules').delete().eq('id', id)
    onSchedulesChange(schedules.filter((s) => s.id !== id))
    setSaving(null)
  }

  const updateField = async (slot: Schedule, field: string, value: string) => {
    const updated = schedules.map((s) => s.id === slot.id ? { ...s, [field]: value } : s)
    onSchedulesChange(updated)
    setSaving(`save-${slot.id}`)
    await supabase.from('schedules').update({ [field]: value } as any).eq('id', slot.id)
    setSaving(null)
  }

  const today = new Date().getDay()

  return (
    <div className="space-y-0">
      {dayNames.map((day, i) => {
        const slots = grouped[i] || []
        const isToday = i === today
        return (
          <div key={i} className={`transition-all duration-200 ${isToday ? 'bg-rose-50/50 dark:bg-rose-950/10 -mx-2 px-2 rounded-xl' : ''}`}>
            <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-neutral-800">
              <div className={`w-12 text-xs font-semibold ${isToday ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                {day}
                {isToday && <span className="block text-[10px] font-normal text-rose-400">today</span>}
              </div>
              <div className="flex-1 min-w-0">
                {slots.length === 0 ? (
                  <span className="text-sm text-neutral-300 dark:text-neutral-600 italic">Free all day</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {slots.map((slot) => (
                      <span
                        key={slot.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-xs text-rose-700 dark:text-rose-300"
                      >
                        {slot.start_time?.slice(0, 5)}–{slot.end_time?.slice(0, 5)}
                        {slot.label && <span className="text-rose-400 dark:text-rose-400">· {slot.label}</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => addSlot(i)}
                disabled={adding === i}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0"
              >
                {adding === i ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            {slots.length > 0 && (
              <div className="py-2 space-y-1.5">
                {slots.map((slot) => {
                  const isSaving = saving === `save-${slot.id}`
                  const isRemoving = saving === `remove-${slot.id}`
                  return (
                    <div key={slot.id} className="flex items-center gap-2 group ml-14">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-300 dark:bg-rose-500 shrink-0" />
                      <input
                        type="time"
                        value={slot.start_time?.slice(0, 5) || '09:00'}
                        onChange={(e) => updateField(slot, 'start_time', e.target.value + ':00')}
                        className="text-xs border border-gray-200 dark:border-neutral-700 rounded-lg px-1.5 sm:px-2 py-1.5 bg-white dark:bg-neutral-800 w-16 sm:w-22 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-800 transition-all"
                      />
                      <span className="text-xs text-neutral-400 shrink-0">–</span>
                      <input
                        type="time"
                        value={slot.end_time?.slice(0, 5) || '17:00'}
                        onChange={(e) => updateField(slot, 'end_time', e.target.value + ':00')}
                        className="text-xs border border-gray-200 dark:border-neutral-700 rounded-lg px-1.5 sm:px-2 py-1.5 bg-white dark:bg-neutral-800 w-16 sm:w-22 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-800 transition-all"
                      />
                      <input
                        type="text"
                        value={slot.label || ''}
                        onChange={(e) => updateField(slot, 'label', e.target.value)}
                        placeholder="What?"
                        className="text-xs sm:text-sm border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 bg-white dark:bg-neutral-800 flex-1 min-w-0 text-neutral-600 dark:text-neutral-400 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-800 transition-all"
                        maxLength={30}
                      />
                      <div className="flex items-center gap-1">
                        {isSaving && <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />}
                        <button
                          onClick={() => removeSlot(slot.id)}
                          disabled={isRemoving}
                          className="text-neutral-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          {isRemoving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      <p className="text-xs text-neutral-400 dark:text-neutral-500 pt-3 text-center">
        <Clock className="w-3 h-3 inline mr-1" />
        Changes save automatically. Hover over a block to delete it.
      </p>
    </div>
  )
}
