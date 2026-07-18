'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Memory } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'
import MemoryForm from '@/components/MemoryForm'
import { BookHeart, LayoutGrid, List, ImageIcon, Play, X, ChevronLeft, ChevronRight, Trash2, User, RotateCcw } from 'lucide-react'
import { notifyMemoryRemoved } from '@/lib/notifications'

export default function MemoriesPage() {
  const { user, profile } = useAuth()
  const [memories, setMemories] = useState<Memory[]>([])
  const [deletedMemories, setDeletedMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'timeline' | 'gallery'>('timeline')
  const [showDeleted, setShowDeleted] = useState(false)
  const [lightbox, setLightbox] = useState<{ idx: number; memories: Memory[] } | null>(null)
  const [userNames, setUserNames] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)

  const reloadMemories = useCallback(() => {
    if (!user) return
    supabase.from('memories').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => {
      if (data) {
        const active: Memory[] = []
        const deleted: Memory[] = []
        data.forEach(m => {
          if (m.deleted_at && m.user_id === user.id) {
            deleted.push(m)
          } else if (!m.deleted_at) {
            active.push(m)
          }
        })
        setMemories(active)
        setDeletedMemories(deleted)
        const ids = Array.from(new Set(data.map(m => m.user_id)))
        if (ids.length > 0) {
          supabase.from('profiles').select('id, name').in('id', ids).then(({ data: profiles }) => {
            if (profiles) {
              const map: Record<string, string> = {}
              profiles.forEach(p => { map[p.id] = p.name })
              setUserNames(map)
            }
          })
        }
      }
      setLoaded(true)
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
        if (m.deleted_at) return
        setMemories((prev) => {
          if (prev.some((x) => x.id === m.id)) return prev
          return [m, ...prev]
        })
        if (!userNames[m.user_id]) {
          supabase.from('profiles').select('id, name').eq('id', m.user_id).single().then(({ data }) => {
            if (data) setUserNames(prev => ({ ...prev, [data.id]: data.name }))
          })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const mediaMemories = memories.filter((m) => m.media_type === 'image' || m.media_type === 'video')
  const galleryItems = view === 'gallery' ? mediaMemories : memories

  const isOwn = (userId: string) => userId === user?.id

  const handleDelete = async (memoryId: string) => {
    if (!user || !confirm('Delete this memory? It will be moved to Recently Deleted.')) return
    const memory = memories.find(m => m.id === memoryId)
    if (!memory) return
    setMemories(prev => prev.filter(m => m.id !== memoryId))
    setDeletedMemories(prev => [{ ...memory, deleted_at: new Date().toISOString() }, ...prev])
    await supabase.from('memories').update({ deleted_at: new Date().toISOString() }).eq('id', memoryId).eq('user_id', user.id)
    reloadMemories()
    if (memory.user_id !== user.id && profile?.partner_id) {
      notifyMemoryRemoved(profile.partner_id, user.id)
    }
  }

  const republishMemory = async (memoryId: string) => {
    if (!user) return
    const memory = deletedMemories.find(m => m.id === memoryId)
    if (!memory) return
    setDeletedMemories(prev => prev.filter(m => m.id !== memoryId))
    setMemories(prev => [{ ...memory, deleted_at: null }, ...prev])
    await supabase.from('memories').update({ deleted_at: null }).eq('id', memoryId).eq('user_id', user.id)
    reloadMemories()
  }

  const displayedMemories = showDeleted ? deletedMemories : memories
  const displayItems = view === 'gallery' ? (showDeleted ? deletedMemories.filter(m => m.media_type === 'image' || m.media_type === 'video') : mediaMemories) : displayedMemories

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
            <BookHeart className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Memories</h1>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">Moments that matter, just for you two</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {deletedMemories.length > 0 && (
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                showDeleted
                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                  : 'bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-amber-600'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {showDeleted ? 'Back' : 'Deleted'}
              {!showDeleted && <span className="ml-0.5 text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 px-1 rounded-full">{deletedMemories.length}</span>}
            </button>
          )}
          <div className="flex bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 p-0.5">
            <button
              onClick={() => setView('timeline')}
              className={`p-2 rounded-lg transition-all ${view === 'timeline' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('gallery')}
              className={`p-2 rounded-lg transition-all ${view === 'gallery' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showDeleted && deletedMemories.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" /> Recently Deleted
            </h3>
            <button onClick={() => setShowDeleted(false)} className="text-xs text-amber-500 hover:text-amber-600 font-medium">Close</button>
          </div>
          <div className="space-y-2">
            {deletedMemories.map(m => (
              <div key={m.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-amber-100 dark:border-amber-900/30">
                <div className="min-w-0 flex-1">
                  {m.image_url && m.media_type === 'image' && (
                    <img src={m.image_url} alt="" className="w-10 h-10 rounded-lg object-cover float-left mr-2" />
                  )}
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{m.content || (m.media_type === 'image' ? '[Photo]' : m.media_type === 'video' ? '[Video]' : '')}</p>
                  <p className="text-[10px] text-neutral-400">{formatDate(m.created_at)} {formatTime(m.created_at)}</p>
                </div>
                <button
                  onClick={() => republishMemory(m.id)}
                  className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3 h-3" /> Re-publish
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showDeleted && view === 'timeline' && <MemoryForm onMemoryAdded={reloadMemories} />}

      {loading ? (
        <div className="space-y-4 animate-pulse-soft">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
              <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4 mb-3" />
              <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-rose-300 dark:text-rose-500" />
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">Your story starts here</p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Share your first special moment together</p>
        </div>
      ) : view === 'timeline' ? (
        <div className="space-y-3">
          {displayItems.map((memory, idx) => (
            <div
              key={memory.id}
              className="group rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-card hover:shadow-card-hover transition-all duration-300"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-300 dark:bg-rose-500 mt-2 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <User className="w-3 h-3" />
                      <span className={isOwn(memory.user_id) ? 'text-rose-500 font-medium' : 'text-emerald-500 font-medium'}>
                        {userNames[memory.user_id] || 'Loading...'}
                      </span>
                      <span className="text-neutral-300">·</span>
                      <span>{formatDate(memory.created_at)}</span>
                      <span className="text-neutral-200">·</span>
                      <span>{formatTime(memory.created_at)}</span>
                    </div>
                    {isOwn(memory.user_id) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(memory.id) }}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        title="Delete memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{memory.content}</p>
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
                      <video src={memory.image_url} className="rounded-xl max-h-64 w-full object-cover border border-gray-100 dark:border-neutral-700" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors rounded-xl">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 text-neutral-800 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {displayItems.map((memory, idx) => (
            <div
              key={memory.id}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-card group cursor-pointer hover:shadow-card-hover transition-all"
              onClick={() => setLightbox({ idx, memories: displayItems })}
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
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white/80 flex items-center gap-1">
                  <User className="w-2.5 h-2.5" />
                  {userNames[memory.user_id] || 'Loading...'}
                </p>
                {memory.content && (
                  <p className="text-white text-xs truncate">{memory.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightbox(null)}>
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
            <div className="text-center mb-3 space-y-1">
              <p className="text-white/70 text-sm">
                {lightbox.idx + 1} / {lightbox.memories.length}
              </p>
              <p className="text-white/50 text-xs flex items-center justify-center gap-1">
                <User className="w-3 h-3" />
                {userNames[lightbox.memories[lightbox.idx].user_id] || 'Loading...'}
                <span className="text-white/30">·</span>
                {formatDate(lightbox.memories[lightbox.idx].created_at)}
                <span className="text-white/30">·</span>
                {formatTime(lightbox.memories[lightbox.idx].created_at)}
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
