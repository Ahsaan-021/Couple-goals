'use client'

import { useEffect, useState } from 'react'
import { X, Camera, Mic, Bell } from 'lucide-react'

interface PermissionState {
  camera: 'prompt' | 'granted' | 'denied' | 'unavailable'
  microphone: 'prompt' | 'granted' | 'denied' | 'unavailable'
  notifications: 'prompt' | 'granted' | 'denied' | 'unavailable'
}

export default function PermissionPrompt() {
  const [dismissed, setDismissed] = useState(true)
  const [perms, setPerms] = useState<PermissionState>({
    camera: 'unavailable', microphone: 'unavailable', notifications: 'unavailable',
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const sd = sessionStorage.getItem('perms_dismissed')
    if (sd) { setDismissed(true); return }
    const p: PermissionState = { camera: 'unavailable', microphone: 'unavailable', notifications: 'unavailable' }
    if ('permissions' in navigator) {
      Promise.all([
        navigator.permissions.query({ name: 'camera' as PermissionName }).then(r => { p.camera = r.state as any }).catch(() => {}),
        navigator.permissions.query({ name: 'microphone' as PermissionName }).then(r => { p.microphone = r.state as any }).catch(() => {}),
      ]).then(() => {
        if (!('Notification' in window)) p.notifications = 'unavailable'
        else p.notifications = Notification.permission as any
        const needs = Object.values(p).some(v => v === 'prompt')
        setPerms(p)
        if (needs) setDismissed(false)
        else sessionStorage.setItem('perms_dismissed', '1')
      })
    } else {
      setPerms(p)
      setDismissed(false)
    }
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
    await Promise.all([ask('camera'), ask('microphone'), ask('notifications')])
    handleDismiss()
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('perms_dismissed', '1')
  }

  if (dismissed) return null

  const needsCamera = perms.camera === 'prompt'
  const needsMic = perms.microphone === 'prompt'
  const needsNotif = perms.notifications === 'prompt'

  if (!needsCamera && !needsMic && !needsNotif) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-[90vw] max-w-md">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 shadow-elevated p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Enable Permissions</p>
          <button onClick={handleDismiss} className="p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Allow access for the best experience</p>
        <div className="flex gap-2">
          {needsCamera && (
            <button onClick={() => ask('camera')} className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
              <Camera className="w-5 h-5 text-neutral-500" />
              <span className="text-[10px] text-neutral-500 font-medium">Camera</span>
            </button>
          )}
          {needsMic && (
            <button onClick={() => ask('microphone')} className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
              <Mic className="w-5 h-5 text-neutral-500" />
              <span className="text-[10px] text-neutral-500 font-medium">Microphone</span>
            </button>
          )}
          {needsNotif && (
            <button onClick={() => ask('notifications')} className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
              <Bell className="w-5 h-5 text-neutral-500" />
              <span className="text-[10px] text-neutral-500 font-medium">Notifications</span>
            </button>
          )}
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
