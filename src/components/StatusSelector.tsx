'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Pencil } from 'lucide-react'

const reasons = [
  { value: 'working', label: 'Working', icon: '💼' },
  { value: 'busy', label: 'Busy', icon: '⚡' },
  { value: 'traveling', label: 'Traveling', icon: '🚗' },
  { value: 'resting', label: 'Resting', icon: '😌' },
  { value: 'meeting', label: 'Meeting', icon: '📋' },
  { value: 'focusing', label: 'Focusing', icon: '🎯' },
  { value: 'commuting', label: 'Commuting', icon: '🚇' },
  { value: 'available', label: 'Available', icon: '🙌' },
]

const emotions = [
  { value: 'low_energy', label: 'Low energy', icon: '😴' },
  { value: 'need_space', label: 'Need space', icon: '🌿' },
  { value: 'miss_you', label: 'Miss you', icon: '💕' },
  { value: 'feeling_good', label: 'Feeling good', icon: '✨' },
  { value: 'stressed', label: 'Stressed', icon: '😰' },
  { value: 'grateful', label: 'Grateful', icon: '🙏' },
  { value: 'loving', label: 'Loving', icon: '🥰' },
  { value: 'thoughtful', label: 'Thoughtful', icon: '🤔' },
]

interface StatusSelectorProps {
  currentReason: string | null | undefined
  currentEmotional: string | null | undefined
  currentCustomReason: string | null | undefined
  onUpdate: (reason?: string, emotional?: string, customReason?: string) => Promise<void>
}

export default function StatusSelector({
  currentReason,
  currentEmotional,
  currentCustomReason,
  onUpdate,
}: StatusSelectorProps) {
  const [saving, setSaving] = useState<string | null>(null)
  const [customNote, setCustomNote] = useState(currentCustomReason || '')
  const [showNoteInput, setShowNoteInput] = useState(false)

  const handleReasonSelect = async (value: string) => {
    setSaving(`reason-${value}`)
    await onUpdate(value, undefined, undefined)
    setSaving(null)
    if (value !== 'available') setShowNoteInput(true)
  }

  const handleEmotionSelect = async (value: string) => {
    setSaving(`emotion-${value}`)
    await onUpdate(undefined, value, undefined)
    setSaving(null)
  }

  const saveCustomNote = async () => {
    setSaving('note')
    await onUpdate(undefined, undefined, customNote)
    setSaving(null)
  }

  const isReasonActive = (val: string) => currentReason === val
  const isEmotionActive = (val: string) => currentEmotional === val

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">What are you up to?</p>
          {currentReason && currentReason !== 'available' && (
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="text-xs text-rose-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <Pencil className="w-3 h-3" />
              {currentCustomReason ? 'Edit note' : 'Add note'}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {reasons.map((r) => {
            const isActive = isReasonActive(r.value)
            const isLoading = saving === `reason-${r.value}`
            return (
              <button
                key={r.value}
                onClick={() => handleReasonSelect(r.value)}
                disabled={!!saving}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                  isActive
                    ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm ring-1 ring-rose-200'
                    : 'bg-white border-border/60 text-gray-500 hover:border-rose-200 hover:bg-rose-50/50 hover:text-gray-700',
                  isLoading && 'opacity-50'
                )}
              >
                <span className={isLoading ? 'animate-pulse' : ''}>{r.icon}</span>
                {r.label}
              </button>
            )
          })}
        </div>

        {showNoteInput && currentReason && currentReason !== 'available' && (
          <div className="mt-3 flex gap-2 animate-slide-down">
            <Input
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder={`Add a note e.g. "Finishing project deadline"`}
              className="flex-1 h-9 text-sm"
              maxLength={100}
            />
            <button
              onClick={saveCustomNote}
              disabled={saving === 'note' || !customNote.trim()}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              {saving === 'note' ? '...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">How are you feeling?</p>
        <div className="flex flex-wrap gap-2">
          {emotions.map((e) => {
            const isActive = isEmotionActive(e.value)
            const isLoading = saving === `emotion-${e.value}`
            return (
              <button
                key={e.value}
                onClick={() => handleEmotionSelect(e.value)}
                disabled={!!saving}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                  isActive
                    ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm ring-1 ring-purple-200'
                    : 'bg-white border-border/60 text-gray-500 hover:border-purple-200 hover:bg-purple-50/50 hover:text-gray-700',
                  isLoading && 'opacity-50'
                )}
              >
                <span className={isLoading ? 'animate-pulse' : ''}>{e.icon}</span>
                {e.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
