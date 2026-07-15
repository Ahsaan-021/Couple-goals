import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

let _supabase: ReturnType<typeof createClient<Database>> | null = null

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    _supabase = createClient<Database>(url || 'https://placeholder.supabase.co', key || 'placeholder-key', {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  }
  return _supabase
}

export const supabase = getSupabase()
