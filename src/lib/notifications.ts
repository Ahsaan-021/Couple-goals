import { supabase } from './supabase'
import { TablesInsert } from './database.types'

type NotificationInsert = TablesInsert<'notifications'>

export async function createNotification(data: Omit<NotificationInsert, 'id' | 'created_at' | 'read'>) {
  const { error } = await supabase.from('notifications').insert(data)
  if (error) console.error('Failed to create notification:', error)
}

export function notifyMemoryAdded(userId: string, actorId: string, body?: string) {
  return createNotification({ user_id: userId, actor_id: actorId, type: 'memory_added', title: 'Your partner added a memory', body })
}

export function notifyMemoryRemoved(userId: string, actorId: string) {
  return createNotification({ user_id: userId, actor_id: actorId, type: 'memory_removed', title: 'Your partner removed a memory' })
}

export function notifyMessage(userId: string, actorId: string, body?: string) {
  return createNotification({ user_id: userId, actor_id: actorId, type: 'message', title: 'New message from your partner', body })
}

export function notifyStatusUpdate(userId: string, actorId: string, body?: string) {
  return createNotification({ user_id: userId, actor_id: actorId, type: 'status_update', title: 'Partner updated their status', body })
}

export function notifyLocationShared(userId: string, actorId: string) {
  return createNotification({ user_id: userId, actor_id: actorId, type: 'location_shared', title: 'Partner shared their location' })
}

export function notifyPartnerConnected(userId: string, actorId: string, name: string) {
  return createNotification({ user_id: userId, actor_id: actorId, type: 'partner_connected', title: `${name} is now your partner` })
}
