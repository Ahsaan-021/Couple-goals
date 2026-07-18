const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://whaqudnoppwvukjifkhe.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'sb_service_key_needed',
  { auth: { persistSession: false } }
)

// We need the service_role key to call auth admin APIs
// This script will only work if SUPABASE_SERVICE_KEY is set
console.log('This requires the service_role key from Supabase dashboard')
console.log('Go to: https://supabase.com/dashboard/project/whaqudnoppwvukjifkhe/settings/api')
console.log('Copy the service_role key and run:')
console.log('$env:SUPABASE_SERVICE_KEY="your_key"; node disable_email_confirm.js')
