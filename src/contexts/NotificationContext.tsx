'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'
import { Message } from '@/types'

interface NotificationContextType {
  unreadCount: number
  mediaNotifications: Message[]
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  mediaNotifications: [],
  clearNotifications: () => {},
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const [mediaNotifications, setMediaNotifications] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

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
      .channel('notification-realtime')
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
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, (payload) => {
        const m = payload.new as Message
        if (m.viewed_at && m.media_url) {
          setMediaNotifications((prev) => prev.filter((n) => n.id !== m.id))
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, profile?.partner_id])

  const clearNotifications = useCallback(() => {
    setMediaNotifications([])
    setUnreadCount(0)
  }, [])

  return (
    <NotificationContext.Provider value={{ unreadCount, mediaNotifications, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
