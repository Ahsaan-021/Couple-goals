'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ImagePlus, Video, Loader2, X, Send, Camera } from 'lucide-react'
import { notifyMemoryAdded } from '@/lib/notifications'
import CameraCapture from '@/components/AdvancedCamera'

interface MemoryFormProps {
  onMemoryAdded: () => void
}

export default function MemoryForm({ onMemoryAdded }: MemoryFormProps) {
  const { user, profile } = useAuth()
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null)
  const [saving, setSaving] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
      setFileType(f.type.startsWith('video/') ? 'video' : 'image')
    }
  }

  const handleCameraCapture = (blob: Blob) => {
    const f = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' })
    setFile(f)
    setPreview(URL.createObjectURL(blob))
    setFileType('image')
    setShowCamera(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || (!content.trim() && !file)) return

    setSaving(true)
    let mediaUrl: string | null = null
    let mediaType: 'text' | 'image' | 'video' = 'text'

    if (file) {
      mediaType = file.type.startsWith('video/') ? 'video' : 'image'
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) mediaUrl = data.url
    }

    await supabase.from('memories').insert({
      user_id: user.id,
      content: content.trim(),
      image_url: mediaUrl,
      media_type: mediaType,
    })

    if (profile?.partner_id) {
      notifyMemoryAdded(profile.partner_id, user.id, content.trim() || undefined)
    }

    setContent('')
    setFile(null)
    setPreview(null)
    setFileType(null)
    setSaving(false)
    onMemoryAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write about a moment you want to remember..."
        className="w-full min-h-[90px] rounded-xl border border-gray-200 bg-neutral-50/50 p-4 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:bg-white resize-none transition-all"
      />

      {preview && fileType === 'image' && (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="h-24 object-cover rounded-xl border border-gray-200" />
          <button
            type="button"
            onClick={() => { setFile(null); setPreview(null); setFileType(null) }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {preview && fileType === 'video' && (
        <div className="relative inline-block">
          <video src={preview} className="h-24 rounded-xl border border-gray-200" controls />
          <button
            type="button"
            onClick={() => { setFile(null); setPreview(null); setFileType(null) }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (fileRef.current) { fileRef.current.accept = 'image/*'; fileRef.current.removeAttribute('capture'); fileRef.current.click() }
            }}
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-neutral-400 hover:text-rose-500 transition-colors"
          >
            <ImagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Photo
          </button>
          <button
            type="button"
            onClick={() => {
              if (fileRef.current) { fileRef.current.accept = 'video/*'; fileRef.current.removeAttribute('capture'); fileRef.current.click() }
            }}
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-neutral-400 hover:text-rose-500 transition-colors"
          >
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Video
          </button>
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-neutral-400 hover:text-rose-500 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Camera
          </button>
        </div>
        <input ref={fileRef} type="file" onChange={handleFileSelect} className="hidden" />
        <Button type="submit" size="sm" disabled={saving || (!content.trim() && !file)}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <><Send className="w-3.5 h-3.5 mr-1.5" /> Save Memory</>
          )}
        </Button>
      </div>
      {showCamera && <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
    </form>
  )
}
