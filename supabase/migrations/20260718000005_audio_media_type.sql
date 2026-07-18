-- Allow 'audio' in media_type CHECK constraint
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_media_type_check;
ALTER TABLE messages ADD CONSTRAINT messages_media_type_check
  CHECK (media_type IN ('text', 'image', 'video', 'audio'));
