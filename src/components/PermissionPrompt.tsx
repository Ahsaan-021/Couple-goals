'use client'

import { useEffect, useState } from 'react'
import { X, Camera, Mic, Bell, Shield } from 'lucide-react'

interface PermissionState {
  camera: 'prompt' | 'granted' | 'denied' | 'unavailable'
  microphone: 'prompt' | 'granted' | 'denied' | 'unavailable'
  notifications: 'prompt' | 'granted' | 'denied' | 'unavailable'
}

export default function PermissionPrompt() {
  const [visible, setVisible] = useState(false)
  const [perms, setPerms] = useState<PermissionState>({
    camera: 'unavailable', microphone: 'unavailable', notifications: 'unavailable',
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const sd = sessionStorage.getItem('perms_dismissed')
    if (sd) return
    const p: PermissionState = { camera: 'unavailable', microphone: 'unavailable', notifications: 'unavailable' }
    const check = async () => {
      if ('permissions' in navigator) {
        await Promise.all([
          navigator.permissions.query({ name: 'camera' as PermissionName }).then(r => { p.camera = r.state as any }).catch(() => {}),
          navigator.permissions.query({ name: 'microphone' as PermissionName }).then(r => { p.microphone = r.state as any }).catch(() => {}),
        ]).catch(() => {})
      } else {
        p.camera = 'prompt'; p.microphone = 'prompt'
      }
      if ('Notification' in window) p.notifications = Notification.permission as any
      else p.notifications = 'unavailable'
      setPerms({ ...p })
      const needs = Object.values(p).some(v => v === 'prompt' || v === 'denied')
      if (needs) setVisible(true)
      else sessionStorage.setItem('perms_dismissed', '1')
    }
    check()
  }, [])

  const ask = async (type: 'camera' | 'microphone' | 'notifications') => {
    try {
      if (type === 'notifications' && 'Notification' in window) {
        const r = await Notification.requestPermission()
        setPerms(p => ({ ...p, notifications: r as any }))
      } else {
        const constraints: any = type === 'camera' ? { video: true } : { audio: true }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        stream.getTracks().forEach(t => t.stop())
        setPerms(p => ({ ...p, [type]: 'granted' }))
      }
    } catch {
      setPerms(p => ({ ...p, [type]: 'denied' }))
    }
  }

  const askAll = async () => {
    await Promise.allSettled([ask('camera'), ask('microphone'), ask('notifications')])
    handleDismiss()
  }

  const handleDismiss = () => {
    setVisible(false)
    sessionStorage.setItem('perms_dismissed', '1')
  }

  if (!visible) return null

  const items = [
    { key: 'camera' as const, label: 'Camera', icon: Camera, needs: perms.camera === 'prompt' || perms.camera === 'denied', status: perms.camera },
    { key: 'microphone' as const, label: 'Microphone', icon: Mic, needs: perms.microphone === 'prompt' || perms.microphone === 'denied', status: perms.microphone },
    { key: 'notifications' as const, label: 'Notifications', icon: Bell, needs: perms.notifications === 'prompt' || perms.notifications === 'denied', status: perms.notifications },
  ]

  const hasAny = items.some(i => i.needs)

  if (!hasAny) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-[90vw] max-w-md">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 shadow-elevated p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Enable Permissions</p>
          </div>
          <button onClick={handleDismiss} className="p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Allow access for camera, mic & notifications</p>
        <div className="flex gap-2">
          {items.filter(i => i.needs).map(item => (
            <button
              key={item.key}
              onClick={() => ask(item.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-colors ${
                item.status === 'denied'
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-400'
                  : 'bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.status === 'denied' && <span className="text-[8px]">Blocked</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={handleDismiss} className="flex-1 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            Skip
          </button>
          <button onClick={askAll} className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-xl transition-colors">
            Allow All
          </button>
        </div>
      </div>
    </div>
  )
}
