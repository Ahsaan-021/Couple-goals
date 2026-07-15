'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Memory } from '@/types'
import { formatDate } from '@/lib/utils'
import MemoryForm from '@/components/MemoryForm'
import { BookHeart, LayoutGrid, List, ImageIcon, Play, X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function MemoriesPage() {
  const { user } = useAuth()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'timeline' | 'gallery'>('timeline')
  const [lightbox, setLightbox] = useState<{ idx: number; memories: Memory[] } | null>(null)

  const reloadMemories = useCallback(() => {
    if (!user) return
    supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setMemories(data)
      })
  }, [user])

  useEffect(() => {
    if (!user) return
    reloadMemories()
    setLoading(false)
  }, [user, reloadMemories])

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('memories-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memories' }, (payload) => {
        const m = payload.new as Memory
        setMemories((prev) => {
          if (prev.some((x) => x.id === m.id)) return prev
          return [m, ...prev]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const mediaMemories = memories.filter((m) => m.media_type === 'image' || m.media_type === 'video')
  const galleryItems = view === 'gallery' ? mediaMemories : memories

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
            <BookHeart className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Memories</h1>
            <p className="text-sm text-neutral-400">Moments that matter, just for you two</p>
          </div>
        </div>
        <div className="flex bg-white rounded-xl border border-gray-200 p-0.5">
          <button
            onClick={() => setView('timeline')}
            className={`p-2 rounded-lg transition-all ${view === 'timeline' ? 'bg-rose-50 text-rose-500' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('gallery')}
            className={`p-2 rounded-lg transition-all ${view === 'gallery' ? 'bg-rose-50 text-rose-500' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === 'timeline' && <MemoryForm onMemoryAdded={reloadMemories} />}

      {loading ? (
        <div className="space-y-4 animate-pulse-soft">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="h-4 bg-neutral-100 rounded w-3/4 mb-3" />
              <div className="h-4 bg-neutral-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-rose-300" />
          </div>
          <p className="text-neutral-500 font-medium">No memories yet</p>
          <p className="text-sm text-neutral-400 mt-1">Start capturing your favourite moments together</p>
        </div>
      ) : view === 'gallery' && galleryItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-amber-300" />
          </div>
          <p className="text-neutral-500 font-medium">No photos or videos yet</p>
          <p className="text-sm text-neutral-400 mt-1">Switch to timeline to add media</p>
        </div>
      ) : view === 'timeline' ? (
        <div className="space-y-3">
          {memories.map((memory, idx) => (
            <div
              key={memory.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card hover:shadow-card-hover transition-all duration-300"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-300 mt-2 shrink-0" />
                <div className="flex-1 space-y-2">
                  <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{memory.content}</p>
                  {memory.image_url && memory.media_type === 'image' && (
                    <img
                      src={memory.image_url}
                      alt="Memory"
                      className="rounded-xl max-h-64 w-full object-cover border border-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setLightbox({ idx: mediaMemories.findIndex((m) => m.id === memory.id), memories: mediaMemories })}
                    />
                  )}
                  {memory.image_url && memory.media_type === 'video' && (
                    <div className="relative group cursor-pointer" onClick={() => setLightbox({ idx: mediaMemories.findIndex((m) => m.id === memory.id), memories: mediaMemories })}>
                      <video src={memory.image_url} className="rounded-xl max-h-64 w-full object-cover border border-gray-100" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors rounded-xl">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 text-neutral-800 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-neutral-400 flex items-center gap-1">
                    {formatDate(memory.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {galleryItems.map((memory, idx) => (
            <div
              key={memory.id}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-white shadow-card group cursor-pointer hover:shadow-card-hover transition-all"
              onClick={() => setLightbox({ idx, memories: galleryItems })}
            >
              {memory.media_type === 'video' ? (
                <>
                  <video src={memory.image_url!} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 text-neutral-800 ml-0.5" />
                    </div>
                  </div>
                </>
              ) : (
                <img src={memory.image_url!} alt="Memory" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              )}
              {memory.content && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{memory.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {lightbox.memories.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightbox((prev) => prev ? { ...prev, idx: (prev.idx - 1 + prev.memories.length) % prev.memories.length } : null)
                }}
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightbox((prev) => prev ? { ...prev, idx: (prev.idx + 1) % prev.memories.length } : null)
                }}
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          <div className="max-w-3xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-3">
              <p className="text-white/70 text-sm">
                {lightbox.idx + 1} / {lightbox.memories.length}
              </p>
            </div>
            {lightbox.memories[lightbox.idx].media_type === 'video' ? (
              <video src={lightbox.memories[lightbox.idx].image_url!} className="max-h-[75vh] w-full rounded-xl" controls autoPlay />
            ) : (
              <img src={lightbox.memories[lightbox.idx].image_url!} alt="Memory" className="max-h-[75vh] w-full object-contain rounded-xl" />
            )}
            {lightbox.memories[lightbox.idx].content && (
              <p className="text-white/80 text-sm mt-3 text-center italic">
                &ldquo;{lightbox.memories[lightbox.idx].content}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
