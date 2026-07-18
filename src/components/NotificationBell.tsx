'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, BellRing, Heart, MessageCircle, MapPin, Clock, ImageIcon, Trash2, UserPlus, X } from 'lucide-react'
import { useNotifications, AppNotification } from '@/contexts/NotificationContext'
import { formatDate, formatTime } from '@/lib/utils'

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  message: MessageCircle,
  memory_added: ImageIcon,
  memory_removed: Trash2,
  status_update: Heart,
  location_shared: MapPin,
  partner_connected: UserPlus,
}

type Tab = 'all' | 'partner' | 'app'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('all')
  const ref = useRef<HTMLDivElement>(null)
  const { notifications, unreadNotifCount, markAsRead, markAllRead, deleteNotification } = useNotifications()

  const totalUnread = unreadNotifCount

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = notifications.filter(n => {
    if (tab === 'all') return true
    if (tab === 'app') return !n.actor_id
    return !!n.actor_id
  })

  const systemTabCount = notifications.filter(n => !n.actor_id && !n.read).length
  const partnerTabCount = notifications.filter(n => n.actor_id && !n.read).length

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: totalUnread },
    { key: 'partner', label: 'Partner', count: partnerTabCount },
    { key: 'app', label: 'App', count: systemTabCount },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
        title="Notifications"
      >
        {totalUnread > 0 ? <BellRing className="w-4 h-4 text-rose-500" /> : <Bell className="w-4 h-4" />}
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-elevated animate-scale-in z-[1000]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Notifications</h3>
            {totalUnread > 0 && (
              <button onClick={markAllRead} className="text-xs text-rose-500 hover:text-rose-600 font-medium">
                Mark all read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-neutral-800 px-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {t.count > 9 ? '9+' : t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-400 dark:text-neutral-500">No notifications yet</p>
              </div>
            ) : (
              filtered.map((n) => {
                const Icon = typeIcons[n.type] || Bell
                const isApp = !n.actor_id
                return (
                  <div
                    key={n.id}
                    className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      n.read
                        ? 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        : 'bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    }`}
                    onClick={() => { if (!n.read) markAsRead(n.id) }}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      n.read
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                        : isApp
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-500'
                          : 'bg-rose-100 dark:bg-rose-900/50 text-rose-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.read ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-900 dark:text-neutral-100 font-medium'}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">{n.body}</p>
                      )}
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                        {formatDate(n.created_at)} {formatTime(n.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
