-- Fix handle_new_user to not set pairing_code_created_by
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing delete policy and replace with code-creator-only delete
DROP POLICY IF EXISTS "Users can delete their messages" ON messages;

-- Only the user who created the pairing code can delete messages
CREATE POLICY "Code creator can delete messages"
  ON messages FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id)
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND pairing_code_created_by = auth.uid()
    )
  );
