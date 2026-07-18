-- Add whatsapp_number column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Add index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_number ON profiles(whatsapp_number);
