'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { X, FlipHorizontal } from 'lucide-react'

interface CameraProps {
  onCapture: (blob: Blob) => void
  onClose: () => void
}

const filters = [
  { name: 'Normal', css: '' },
  { name: 'Warm', css: 'sepia(0.3) saturate(1.3) contrast(1.1)' },
  { name: 'Cool', css: 'hue-rotate(180deg) saturate(0.8)' },
  { name: 'Vintage', css: 'sepia(0.6) contrast(1.05) brightness(0.9)' },
  { name: 'Grayscale', css: 'grayscale(1) brightness(1.05)' },
  { name: 'Dreamy', css: 'blur(1px) brightness(1.15) saturate(1.2)' },
  { name: 'Noir', css: 'grayscale(0.8) contrast(1.3) brightness(0.8)' },
  { name: 'Pastel', css: 'saturate(0.6) brightness(1.2) hue-rotate(-10deg)' },
]

export default function Camera({ onCapture, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [activeFilter, setActiveFilter] = useState(0)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [error, setError] = useState('')

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setError('')
    } catch {
      setError('Camera access denied or not available')
    }
  }, [facingMode])

  useEffect(() => {
    startCamera()
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [startCamera])

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.filter = filters[activeFilter].css
    ctx.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob)
    }, 'image/jpeg', 0.92)
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[1001] bg-black flex flex-col items-center justify-center p-6">
        <p className="text-white/80 text-sm mb-4">{error}</p>
        <button onClick={onClose} className="text-white/60 text-xs underline">Close</button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[1001] bg-black flex flex-col">
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
          style={{ filter: filters[activeFilter].css }}
        />
        <div className="absolute inset-0 pointer-events-none border-[3px] border-white/10 rounded-3xl m-8" />
      </div>

      <div className="pb-8 pt-4 px-4 space-y-4">
        <div className="flex justify-center gap-2 overflow-x-auto pb-1 px-2">
          {filters.map((f, i) => (
            <button
              key={f.name}
              onClick={() => setActiveFilter(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                i === activeFilter
                  ? 'bg-white text-black'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-8">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={capture}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-white" />
          </button>
          <button
            onClick={toggleCamera}
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <FlipHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
