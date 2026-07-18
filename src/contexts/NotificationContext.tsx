'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'
import { Message } from '@/types'

export interface AppNotification {
  id: string
  user_id: string
  actor_id: string | null
  type: string
  title: string
  body: string | null
  read: boolean
  created_at: string
}

interface NotificationContextType {
  unreadCount: number
  mediaNotifications: Message[]
  notifications: AppNotification[]
  unreadNotifCount: number
  clearNotifications: () => void
  markAsRead: (id: string) => void
  markAllRead: () => void
  deleteNotification: (id: string) => void
  requestPushPermission: () => Promise<boolean>
  pushSupported: boolean
  pushEnabled: boolean
  togglePushEnabled: () => void
  lastCheckedIn: Date | null
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  mediaNotifications: [],
  notifications: [],
  unreadNotifCount: 0,
  clearNotifications: () => {},
  markAsRead: () => {},
  markAllRead: () => {},
  deleteNotification: () => {},
  requestPushPermission: async () => false,
  pushSupported: false,
  pushEnabled: false,
  togglePushEnabled: () => {},
  lastCheckedIn: null,
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const [mediaNotifications, setMediaNotifications] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [pushEnabled, setPushEnabled] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('pushEnabled') === 'true'
    return false
  })
  const [lastCheckedIn, setLastCheckedIn] = useState<Date | null>(null)

  const pushSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
  const unreadNotifCount = notifications.filter(n => !n.read).length

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!pushSupported) return false
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setPushEnabled(true)
        localStorage.setItem('pushEnabled', 'true')
        return true
      }
      return false
    } catch {
      return false
    }
  }, [pushSupported])

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if (pushEnabled && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.svg' })
    }
  }, [pushEnabled])

  // Poll for last status/mood update
  useEffect(() => {
    if (!user) return
    supabase.from('statuses').select('updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1).then(({ data }) => {
      if (data?.[0]) setLastCheckedIn(new Date(data[0].updated_at))
    })
  }, [user])

  // Fetch initial notifications + subscribe to new ones
  useEffect(() => {
    if (!user) return

    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) {
          const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
          const oldMsgIds = data.filter(n => n.type === 'message' && n.created_at < oneHourAgo).map(n => n.id)
          if (oldMsgIds.length > 0) {
            supabase.from('notifications').delete().in('id', oldMsgIds)
            setNotifications((data.filter(n => !oldMsgIds.includes(n.id))) as AppNotification[])
          } else {
            setNotifications(data as AppNotification[])
          }
        }
      })

    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const n = payload.new as AppNotification
        setNotifications((prev) => [n, ...prev])
        sendBrowserNotification(n.title, n.body || '')
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, sendBrowserNotification])

  // Track media messages for chat badge
  useEffect(() => {
    if (!user || !profile?.partner_id) return

    supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', user.id)
      .is('viewed_at', null)
      .not('media_url', 'is', null)
      .then(({ data }) => {
        if (data) {
          setMediaNotifications(data as Message[])
          setUnreadCount(data.length)
        }
      })

    const channel = supabase
      .channel('media-notification-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, (payload) => {
        const m = payload.new as Message
        if (m.media_url) {
          setMediaNotifications((prev) => [...prev, m])
          setUnreadCount((prev) => prev + 1)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, profile?.partner_id])

  const clearNotifications = useCallback(() => {
    setMediaNotifications([])
    setUnreadCount(0)
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    supabase.from('notifications').update({ read: true }).eq('id', id).then(({ error }) => {
      if (error) console.error('Failed to mark notification as read:', error)
    })
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    if (!user?.id) return
    supabase.from('notifications').update({ read: true }).eq('user_id', user.id).then(({ error }) => {
      if (error) console.error('Failed to mark all as read:', error)
    })
  }, [user?.id])

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    supabase.from('notifications').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Failed to delete notification:', error)
    })
  }, [])

  const togglePushEnabled = useCallback(() => {
    setPushEnabled(prev => {
      const next = !prev
      localStorage.setItem('pushEnabled', String(next))
      return next
    })
  }, [])

  return (
    <NotificationContext.Provider value={{
      unreadCount, mediaNotifications, notifications, unreadNotifCount,
      clearNotifications, markAsRead, markAllRead, deleteNotification,
      requestPushPermission, pushSupported, pushEnabled, togglePushEnabled, lastCheckedIn,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
