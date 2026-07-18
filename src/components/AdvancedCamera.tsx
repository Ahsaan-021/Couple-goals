'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { X, FlipHorizontal, Sparkles, Loader2 } from 'lucide-react'

interface CameraProps {
  onCapture: (blob: Blob) => void
  onClose: () => void
}

const modes = [
  { name: 'Normal', filter: '' },
  { name: 'Beauty', filter: 'brightness(1.1) contrast(1.05) saturate(1.12) sepia(0.03)' },
  { name: 'Glow', filter: 'brightness(1.18) contrast(1.02) saturate(1.15) sepia(0.05) blur(0.3px)' },
  { name: 'Warm', filter: 'brightness(1.08) contrast(1.08) saturate(1.08) sepia(0.12)' },
  { name: 'Cool', filter: 'brightness(1.05) contrast(1.02) saturate(0.9) hue-rotate(10deg)' },
]

export default function AdvancedCamera({ onCapture, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const captureCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animRef = useRef<number>(0)

  const [activeMode, setActiveMode] = useState(1)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [error, setError] = useState('')
  const [modelReady, setModelReady] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setError('')
    } catch (e: any) {
      setError(e?.name === 'NotAllowedError' ? 'Camera permission denied. Please allow camera access in your browser settings and reload.' : 'Camera not available or already in use')
    }
  }, [facingMode])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const tf = await import('@tensorflow/tfjs-core')
        await import('@tensorflow/tfjs-backend-webgl')
        await tf.setBackend('webgl')
        const faceLandmarks = await import('@tensorflow-models/face-landmarks-detection')
        await faceLandmarks.createDetector(
          faceLandmarks.SupportedModels.MediaPipeFaceMesh,
          { runtime: 'tfjs', refineLandmarks: true, maxFaces: 1 }
        )
      } catch (e) {
        console.warn('AI model optional, continuing without:', e)
      }
      if (!cancelled) setModelReady(true)
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      cancelAnimationFrame(animRef.current)
    }
  }, [startCamera])

  const capture = () => {
    const video = videoRef.current
    const canvas = captureCanvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1) }
    ctx.filter = modes[activeMode].filter
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
          style={{ filter: modes[activeMode].filter }}
        />
        <canvas ref={captureCanvasRef} className="hidden" />
        {!modelReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
              <p className="text-white/70 text-xs">Loading AI beauty...</p>
            </div>
          </div>
        )}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5">
          <span className="text-white/70 text-xs font-medium flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> AI Beauty
          </span>
        </div>
        <div className="absolute inset-0 pointer-events-none border-[3px] border-white/10 rounded-3xl m-8" />
      </div>

      <div className="pb-8 pt-4 px-4 space-y-4">
        <div className="flex justify-center gap-2 overflow-x-auto pb-1 px-2">
          {modes.map((m, i) => (
            <button
              key={m.name}
              onClick={() => setActiveMode(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                i === activeMode
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              {m.name}
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
