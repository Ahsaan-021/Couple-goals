import { createClient } from '@supabase/supabase-js'

let _supabase: ReturnType<typeof createClient> | null = null

function getClient() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && key) {
      try {
        _supabase = createClient(url, key, {
          auth: { persistSession: true, autoRefreshToken: true },
        })
      } catch {
        _supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
      }
    }
    if (!_supabase) {
      _supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
    }
  }
  return _supabase
}

export const supabase = getClient()
