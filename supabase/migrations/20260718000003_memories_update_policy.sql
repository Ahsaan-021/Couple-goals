CREATE POLICY "Users can update their own memories"
  ON memories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partners can update shared memories"
  ON memories FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT partner_id FROM profiles WHERE id = memories.user_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT partner_id FROM profiles WHERE id = memories.user_id
    )
  );
