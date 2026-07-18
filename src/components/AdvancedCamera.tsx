'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { X, FlipHorizontal, Sparkles, Loader2 } from 'lucide-react'

interface CameraProps {
  onCapture: (blob: Blob) => void
  onClose: () => void
}

const modes = [
  { name: 'Normal', smoothness: 0, brightness: 1, contrast: 1, saturation: 1, warmth: 0, highlight: 0 },
  { name: 'Beauty', smoothness: 0.65, brightness: 1.12, contrast: 1.08, saturation: 1.15, warmth: 0.08, highlight: 0.3 },
  { name: 'Glow', smoothness: 0.5, brightness: 1.18, contrast: 1.05, saturation: 1.2, warmth: 0.12, highlight: 0.5 },
  { name: 'Warm', smoothness: 0.4, brightness: 1.1, contrast: 1.1, saturation: 1.1, warmth: 0.2, highlight: 0.2 },
  { name: 'Cool', smoothness: 0.4, brightness: 1.05, contrast: 1.05, saturation: 1.0, warmth: -0.15, highlight: 0.2 },
]

export default function AdvancedCamera({ onCapture, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<any>(null)
  const animRef = useRef<number>(0)
  const frameCountRef = useRef(0)
  const faceRef = useRef<{ x: number; y: number; w: number; h: number; kpts: { x: number; y: number }[] } | null>(null)

  const [activeMode, setActiveMode] = useState(1)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [detectReady, setDetectReady] = useState(false)

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
    } catch {
      setError('Camera access denied or not available')
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
        const detector = await faceLandmarks.createDetector(
          faceLandmarks.SupportedModels.MediaPipeFaceMesh,
          { runtime: 'tfjs', refineLandmarks: true, maxFaces: 1 }
        )
        if (!cancelled) {
          detectorRef.current = detector
          setDetectReady(true)
        }
      } catch (e) {
        console.warn('Face model load failed, using fallback:', e)
        if (!cancelled) setDetectReady(true)
      }
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

  const processFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) { animRef.current = requestAnimationFrame(processFrame); return }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    frameCountRef.current++

    if (detectorRef.current && frameCountRef.current % 2 === 0) {
      detectorRef.current.estimateFaces(video).then((faces: any[]) => {
        if (faces.length > 0) {
          const face = faces[0]
          const kpts = face.keypoints.map((k: any) => ({ x: k.x, y: k.y }))
          const xs = kpts.map((k: { x: number }) => k.x)
          const ys = kpts.map((k: { y: number }) => k.y)
          faceRef.current = {
            x: Math.min(...xs), y: Math.min(...ys),
            w: Math.max(...xs) - Math.min(...xs),
            h: Math.max(...ys) - Math.min(...ys),
            kpts,
          }
        } else {
          faceRef.current = null
        }
      }).catch(() => {})
    }

    const mode = modes[activeMode]
    if (mode.name === 'Normal') {
      ctx.save()
      if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1) }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      ctx.restore()
      setLoading(false)
      animRef.current = requestAnimationFrame(processFrame)
      return
    }

    const w = canvas.width, h = canvas.height

    ctx.save()
    if (facingMode === 'user') { ctx.translate(w, 0); ctx.scale(-1, 1) }
    ctx.drawImage(video, 0, 0, w, h)
    ctx.restore()

    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data

    const face = faceRef.current
    if (face) {
      const cx = facingMode === 'user' ? w - (face.x + face.w / 2) : face.x + face.w / 2
      const cy = face.y + face.h / 2
      const rx = face.w * 0.65
      const ry = face.h * 0.8
      const softness = 0.35

      const blurRadius = Math.max(3, Math.round(mode.smoothness * 12))

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = w; tempCanvas.height = h
      const tCtx = tempCanvas.getContext('2d')
      if (!tCtx) { animRef.current = requestAnimationFrame(processFrame); return }

      tCtx.drawImage(canvas, 0, 0)
      tCtx.filter = `blur(${blurRadius}px)`
      tCtx.drawImage(canvas, 0, 0)

      const blurredData = tCtx.getImageData(0, 0, w, h).data

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = (x - cx) / rx
          const dy = (y - cy) / ry
          const dist = Math.sqrt(dx * dx + dy * dy)
          const idx = (y * w + x) * 4

          if (dist < 1 - softness) {
            data[idx] = blurredData[idx]
            data[idx + 1] = blurredData[idx + 1]
            data[idx + 2] = blurredData[idx + 2]
          } else if (dist < 1) {
            const t = (dist - (1 - softness)) / softness
            data[idx] = data[idx] * t + blurredData[idx] * (1 - t)
            data[idx + 1] = data[idx + 1] * t + blurredData[idx + 1] * (1 - t)
            data[idx + 2] = data[idx + 2] * t + blurredData[idx + 2] * (1 - t)
          }
        }
      }
    }

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2]

      if (mode.warmth !== 0) {
        r += mode.warmth * 40
        b -= mode.warmth * 30
      }

      if (mode.saturation !== 1) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        r = gray + (r - gray) * mode.saturation
        g = gray + (g - gray) * mode.saturation
        b = gray + (b - gray) * mode.saturation
      }

      if (mode.contrast !== 1) {
        r = (r - 128) * mode.contrast + 128
        g = (g - 128) * mode.contrast + 128
        b = (b - 128) * mode.contrast + 128
      }

      if (mode.brightness !== 1) {
        r *= mode.brightness
        g *= mode.brightness
        b *= mode.brightness
      }

      if (mode.highlight > 0 && face) {
        const luma = 0.299 * r + 0.587 * g + 0.114 * b
        if (luma > 150) {
          const boost = (luma - 150) / 105 * mode.highlight * 0.3
          r += boost * 20
          g += boost * 15
          b += boost * 10
        }
      }

      data[i] = Math.min(255, Math.max(0, r))
      data[i + 1] = Math.min(255, Math.max(0, g))
      data[i + 2] = Math.min(255, Math.max(0, b))
    }

    ctx.putImageData(imageData, 0, 0)
    setLoading(false)
    animRef.current = requestAnimationFrame(processFrame)
  }, [activeMode, facingMode])

  useEffect(() => {
    if (!detectReady) return
    animRef.current = requestAnimationFrame(processFrame)
    return () => cancelAnimationFrame(animRef.current)
  }, [detectReady, processFrame])

  const capture = () => {
    const canvas = canvasRef.current
    if (!canvas) return
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
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
              <p className="text-white/70 text-xs">Loading beauty filters...</p>
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
