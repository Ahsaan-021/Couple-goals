-- Storage RLS policies for memories bucket
CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'memories');

CREATE POLICY "Users can view their own photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view partner's photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'memories'
    AND (
      (storage.foldername(name))[1] IN (
        SELECT partner_id::text FROM profiles WHERE id = auth.uid()
        UNION
        SELECT id::text FROM profiles WHERE partner_id = auth.uid()
      )
    )
  );
