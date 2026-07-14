-- Enable Realtime for statuses and memories tables
ALTER PUBLICATION supabase_realtime ADD TABLE statuses;
ALTER PUBLICATION supabase_realtime ADD TABLE memories;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Add media_type column to memories (text, image, video)
ALTER TABLE memories ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text'
  CHECK (media_type IN ('text', 'image', 'video'));

-- Enable storage for videos (additional MIME types)
-- (Videos are stored in the existing 'memories' bucket)
