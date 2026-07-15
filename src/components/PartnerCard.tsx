'use client'

import { PartnerStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, MessageSquareText, Briefcase, Zap, Car, Coffee, ClipboardList, Target, Train, CheckCircle, BatteryLow, Wind, Sparkles, AlertTriangle, Sun, BrainCircuit } from 'lucide-react'

const reasonLabels: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  working: { label: 'Working', icon: Briefcase, color: 'bg-blue-50 border-blue-200' },
  busy: { label: 'Busy', icon: Zap, color: 'bg-orange-50 border-orange-200' },
  traveling: { label: 'Traveling', icon: Car, color: 'bg-amber-50 border-amber-200' },
  resting: { label: 'Resting', icon: Coffee, color: 'bg-green-50 border-green-200' },
  meeting: { label: 'In a meeting', icon: ClipboardList, color: 'bg-purple-50 border-purple-200' },
  focusing: { label: 'Focusing', icon: Target, color: 'bg-indigo-50 border-indigo-200' },
  commuting: { label: 'Commuting', icon: Train, color: 'bg-gray-50 border-gray-200' },
  available: { label: 'Available', icon: CheckCircle, color: 'bg-emerald-50 border-emerald-200' },
}

const emotionalLabels: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  low_energy: { label: 'Low energy', icon: BatteryLow },
  need_space: { label: 'Needs space', icon: Wind },
  miss_you: { label: 'Misses you', icon: Heart },
  feeling_good: { label: 'Feeling good', icon: Sparkles },
  stressed: { label: 'Stressed', icon: AlertTriangle },
  grateful: { label: 'Grateful', icon: Sun },
  loving: { label: 'Loving', icon: Heart },
  thoughtful: { label: 'Thoughtful', icon: BrainCircuit },
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

  const firstLetter = partner.profile.name?.charAt(0)?.toUpperCase() || 'P'

  return (
    <Card className="border-rose-100/50 overflow-hidden">
      <CardContent className="pt-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 font-semibold text-lg">
            {firstLetter}
          </div>
          <div className="flex-1">
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Partner</p>
            <h3 className="font-semibold text-neutral-900">{partner.profile.name}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Online
          </div>
        </div>

        {hasStatus ? (
          <div className="flex flex-wrap gap-2">
            {reason && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${reason.color}`}>
                <reason.icon className="w-4 h-4" />
                {reason.label}
              </span>
            )}
            {emotion && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border bg-rose-50 border-rose-200/50 text-rose-700">
                <emotion.icon className="w-4 h-4" />
                {emotion.label}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-neutral-400 flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-neutral-300" />
            No status shared yet
          </p>
        )}

        {partner.status?.custom_reason && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2.5">
            <MessageSquareText className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
            <p className="text-sm text-neutral-600 italic">&ldquo;{partner.status.custom_reason}&rdquo;</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
