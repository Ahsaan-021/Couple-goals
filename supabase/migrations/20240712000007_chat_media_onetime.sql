-- Add media support and one-time view to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text'
  CHECK (media_type IN ('text', 'image', 'video'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_one_time BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

-- RLS: receiver can update viewed_at on messages they received
CREATE POLICY "Users can mark messages as viewed"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id AND is_one_time = TRUE AND viewed_at IS NULL)
  WITH CHECK (auth.uid() = receiver_id AND viewed_at IS NOT NULL);
