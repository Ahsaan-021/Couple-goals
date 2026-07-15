'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Message, Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { MessageCircle, Send, Trash2, Loader2, Heart, ImagePlus, Video, Eye, EyeOff, Play, X, Maximize2 } from 'lucide-react'

function Lightbox({ message, onClose }: { message: Message; onClose: () => void }) {
  const isVideo = message.media_type === 'video'

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        onClick={onClose}
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        {isVideo ? (
          <video src={message.media_url!} className="max-h-[85vh] w-full rounded-xl" controls autoPlay />
        ) : (
          <img src={message.media_url!} alt="Shared" className="max-h-[85vh] w-full object-contain rounded-xl" />
        )}
        {message.content && (
          <p className="text-white/80 text-sm mt-3 text-center italic max-w-xl mx-auto">&ldquo;{message.content}&rdquo;</p>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileMediaType, setFileMediaType] = useState<'image' | 'video' | null>(null)
  const [isOneTime, setIsOneTime] = useState(false)
  const [sending, setSending] = useState(false)
  const [partner, setPartner] = useState<Profile | null>(null)
  const [clearing, setClearing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lightboxMsg, setLightboxMsg] = useState<Message | null>(null)
  const [pendingViewIds, setPendingViewIds] = useState<Set<string>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user || !profile) return
    ;(async () => {
      if (!profile.partner_id) { setLoading(false); return }
      const { data: partnerData } = await supabase.from('profiles').select('*').eq('id', profile.partner_id).single()
      if (partnerData) setPartner(partnerData)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true })

      if (msgs) setMessages(msgs)
      setLoading(false)
    })()
  }, [user, profile])

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('chat-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const m = payload.new as Message
        if (m.sender_id === user.id || m.receiver_id === user.id) {
          setMessages((prev) => [...prev, m])
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const m = payload.new as Message
        if (m.sender_id === user.id || m.receiver_id === user.id) {
          setMessages((prev) => prev.map((x) => x.id === m.id ? m : x))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const closeLightbox = useCallback(async () => {
    if (lightboxMsg && lightboxMsg.is_one_time && !lightboxMsg.viewed_at) {
      const msgId = lightboxMsg.id
      if (!pendingViewIds.has(msgId)) {
        setPendingViewIds((prev) => new Set(prev).add(msgId))
        await supabase.from('messages').update({ viewed_at: new Date().toISOString() }).eq('id', msgId)
      }
    }
    setLightboxMsg(null)
  }, [lightboxMsg, pendingViewIds])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setFilePreview(URL.createObjectURL(f))
      setFileMediaType(f.type.startsWith('video/') ? 'video' : 'image')
    }
  }

  const clearFile = () => {
    setFile(null)
    setFilePreview(null)
    setFileMediaType(null)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile?.partner_id || (!input.trim() && !file)) return

    setSending(true)
    let mediaUrl: string | null = null
    let mediaType: 'text' | 'image' | 'video' = 'text'

    if (file) {
      mediaType = file.type.startsWith('video/') ? 'video' : 'image'
      const ext = file.name.split('.').pop()
      const filePath = `chat/${user.id}/${Date.now()}.${ext}`
      const { data: uploadData } = await supabase.storage
        .from('memories')
        .upload(filePath, file)

      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('memories')
          .getPublicUrl(filePath)
        mediaUrl = publicUrl
      }
    }

    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: profile.partner_id,
      content: input.trim(),
      media_url: mediaUrl,
      media_type: mediaType,
      is_one_time: isOneTime,
    })

    setInput('')
    clearFile()
    setIsOneTime(false)
    setSending(false)
  }

  const clearChat = async () => {
    if (!user || !confirm('Clear all messages?')) return
    setClearing(true)
    await supabase.from('messages').delete().or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    setMessages([])
    setClearing(false)
  }

  if (!profile?.partner_id) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-rose-300" />
        </div>
        <p className="text-neutral-500 font-medium">No partner connected</p>
        <p className="text-sm text-neutral-400 mt-1">Link with your partner in Settings to start chatting</p>
      </div>
    )
  }

  const partnerName = partner?.name || 'Partner'

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Chat</h1>
            <p className="text-sm text-neutral-400">with {partnerName}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} disabled={clearing || messages.length === 0} className="text-neutral-400 hover:text-red-500">
          {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          <span className="ml-1.5 hidden sm:inline">Clear Chat</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="space-y-3 animate-pulse-soft">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`h-10 rounded-2xl ${i % 2 === 0 ? 'bg-rose-100 w-48' : 'bg-gray-100 w-36'}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-7 h-7 text-neutral-300" />
            </div>
            <p className="text-neutral-500 font-medium">No messages yet</p>
            <p className="text-sm text-neutral-400 mt-1">Say something to {partnerName}</p>
          </div>
        ) : (
          messages.map((m) => {
            const isOwn = m.sender_id === user!.id
            const isViewed = !!m.viewed_at
            const hasMedia = m.media_url && (m.media_type === 'image' || m.media_type === 'video')
            const isUnviewedOneTime = !isOwn && m.is_one_time && !isViewed

            return (
              <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                    isOwn
                      ? 'bg-rose-500 text-white rounded-br-md'
                      : 'bg-white border border-gray-100 text-neutral-700 rounded-bl-md shadow-card'
                  }`}
                >
                  {isUnviewedOneTime ? (
                    <button
                      onClick={() => setLightboxMsg(m)}
                      className="flex flex-col items-center gap-1.5 py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors w-full text-center"
                    >
                      {hasMedia ? (
                        m.media_type === 'video' ? <Play className="w-6 h-6 text-neutral-400" /> : <ImagePlus className="w-6 h-6 text-neutral-400" />
                      ) : (
                        <EyeOff className="w-6 h-6 text-neutral-400" />
                      )}
                      <span className="text-xs text-neutral-500 font-medium">Tap to view once</span>
                    </button>
                  ) : (
                    <>
                      {m.content && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                      )}
                      {hasMedia && (m.is_one_time && !isOwn && isViewed ? null : (
                        <div
                          className={`relative mt-1.5 cursor-pointer group ${m.is_one_time && !isOwn && isViewed ? 'hidden' : ''}`}
                          onClick={() => setLightboxMsg(m)}
                        >
                          {m.media_type === 'video' ? (
                            <>
                              <video src={m.media_url!} className="rounded-xl max-h-60 w-full object-cover border border-white/20" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors rounded-xl">
                                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                  <Play className="w-4 h-4 text-neutral-800 ml-0.5" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <img
                              src={m.media_url!}
                              alt="Shared"
                              className="rounded-xl max-h-60 w-full object-cover border border-white/20 group-hover:opacity-95 transition-opacity"
                            />
                          )}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <p className={`text-[10px] ${isOwn ? 'text-white/60' : 'text-neutral-400'}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {m.is_one_time && (
                      <span className={`inline-flex items-center gap-0.5 text-[10px] ${isOwn ? 'text-white/70' : 'text-amber-500'}`}>
                        {isViewed ? 'Viewed' : (isOwn ? 'Not viewed' : 'One-time')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {lightboxMsg && <Lightbox message={lightboxMsg} onClose={closeLightbox} />}

      <form onSubmit={sendMessage} className="mt-4 shrink-0 space-y-2">
        {filePreview && (
          <div className="relative inline-block ml-1">
            {fileMediaType === 'video' ? (
              <video src={filePreview} className="h-16 rounded-lg border border-gray-200" />
            ) : (
              <img src={filePreview} alt="Preview" className="h-16 rounded-lg border border-gray-200 object-cover" />
            )}
            <button
              type="button"
              onClick={clearFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1 flex items-center gap-1.5 bg-white rounded-xl border border-gray-200 px-3 py-1.5">
            <button
              type="button"
              onClick={() => { if (fileRef.current) { fileRef.current.accept = 'image/*'; fileRef.current.click() } }}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-rose-500 transition-colors shrink-0"
              title="Send photo"
            >
              <ImagePlus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { if (fileRef.current) { fileRef.current.accept = 'video/*'; fileRef.current.click() } }}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-rose-500 transition-colors shrink-0"
              title="Send video"
            >
              <Video className="w-4 h-4" />
            </button>
            <input ref={fileRef} type="file" onChange={handleFileSelect} className="hidden" />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${partnerName}...`}
              maxLength={2000}
              className="flex-1 bg-transparent py-2 text-sm placeholder:text-neutral-400 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setIsOneTime(!isOneTime)}
              className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                isOneTime ? 'bg-amber-100 text-amber-500' : 'hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600'
              }`}
              title={isOneTime ? 'One-time view ON' : 'One-time view OFF'}
            >
              {isOneTime ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button type="submit" size="icon" disabled={sending || (!input.trim() && !file)} className="shrink-0 rounded-xl w-11 h-11">
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </form>
    </div>
  )
}
