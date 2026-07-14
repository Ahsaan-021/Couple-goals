'use client'

import { PartnerStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, User, MessageSquareText } from 'lucide-react'

const reasonLabels: Record<string, { label: string; icon: string; color: string }> = {
  working: { label: 'Working', icon: '💼', color: 'bg-blue-50 border-blue-200' },
  busy: { label: 'Busy', icon: '⚡', color: 'bg-orange-50 border-orange-200' },
  traveling: { label: 'Traveling', icon: '🚗', color: 'bg-amber-50 border-amber-200' },
  resting: { label: 'Resting', icon: '😌', color: 'bg-green-50 border-green-200' },
  meeting: { label: 'In a meeting', icon: '📋', color: 'bg-purple-50 border-purple-200' },
  focusing: { label: 'Focusing', icon: '🎯', color: 'bg-indigo-50 border-indigo-200' },
  commuting: { label: 'Commuting', icon: '🚇', color: 'bg-gray-50 border-gray-200' },
  available: { label: 'Available', icon: '🙌', color: 'bg-emerald-50 border-emerald-200' },
}

const emotionalLabels: Record<string, { label: string; icon: string }> = {
  low_energy: { label: 'Low energy', icon: '😴' },
  need_space: { label: 'Needs space', icon: '🌿' },
  miss_you: { label: 'Misses you', icon: '💕' },
  feeling_good: { label: 'Feeling good', icon: '✨' },
  stressed: { label: 'Stressed', icon: '😰' },
  grateful: { label: 'Grateful', icon: '🙏' },
  loving: { label: 'Loving', icon: '🥰' },
  thoughtful: { label: 'Thoughtful', icon: '🤔' },
}

interface PartnerCardProps {
  partner: PartnerStatus
}

export default function PartnerCard({ partner }: PartnerCardProps) {
  const reason = partner.status?.reason_status
    ? reasonLabels[partner.status.reason_status]
    : null
  const emotion = partner.status?.emotional_status
    ? emotionalLabels[partner.status.emotional_status]
    : null
  const hasStatus = reason || emotion

  return (
    <Card className="bg-gradient-to-br from-rose-50/80 to-purple-50/80 border-rose-100/50 overflow-hidden">
      <CardContent className="pt-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Partner</p>
            <h3 className="font-semibold text-gray-800">{partner.profile.name}</h3>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Online
          </div>
        </div>

        {hasStatus ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {reason && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${reason.color}`}>
                <span>{reason.icon}</span>
                {reason.label}
              </span>
            )}
            {emotion && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border bg-white border-purple-200/50 text-purple-700">
                <span>{emotion.icon}</span>
                {emotion.label}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-rose-300" />
            No status shared yet
          </p>
        )}

        {partner.status?.custom_reason && (
          <div className="mt-3 pt-3 border-t border-border/30 flex items-start gap-2">
            <MessageSquareText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-600 italic">&ldquo;{partner.status.custom_reason}&rdquo;</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
