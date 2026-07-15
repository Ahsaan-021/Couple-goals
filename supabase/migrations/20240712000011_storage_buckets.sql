-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to view any avatar
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

-- Allow users to update/delete their own avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create a disconnect_requests table
CREATE TABLE disconnect_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  requestee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE disconnect_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own disconnect requests"
  ON disconnect_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = requestee_id);

CREATE POLICY "Users can create disconnect requests"
  ON disconnect_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update disconnect requests they receive"
  ON disconnect_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = requestee_id)
  WITH CHECK (auth.uid() = requestee_id);

-- Function to request disconnect
CREATE OR REPLACE FUNCTION public.request_disconnect()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_partner_id UUID;
  v_partner_name TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT partner_id INTO v_partner_id FROM profiles WHERE id = v_user_id;

  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No partner connected');
  END IF;

  SELECT name INTO v_partner_name FROM profiles WHERE id = v_partner_id;

  -- Cancel any existing pending requests
  UPDATE disconnect_requests SET status = 'rejected'
  WHERE (requester_id = v_user_id OR requester_id = v_partner_id)
    AND status = 'pending';

  -- Insert new request
  INSERT INTO disconnect_requests (requester_id, requestee_id, status)
  VALUES (v_user_id, v_partner_id, 'pending');

  RETURN jsonb_build_object('success', true, 'partner_name', v_partner_name);
END;
$$;

-- Function to approve disconnect
CREATE OR REPLACE FUNCTION public.approve_disconnect()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_partner_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT partner_id INTO v_partner_id FROM profiles WHERE id = v_user_id;

  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No partner connected');
  END IF;

  -- Update any pending requests targeting this user
  UPDATE disconnect_requests SET status = 'approved'
  WHERE requestee_id = v_user_id AND status = 'pending';

  -- Disconnect both
  UPDATE profiles SET partner_id = NULL WHERE id IN (v_user_id, v_partner_id);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function to reject disconnect
CREATE OR REPLACE FUNCTION public.reject_disconnect()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_partner_id UUID;
  v_requester_name TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  UPDATE disconnect_requests SET status = 'rejected'
  WHERE requestee_id = v_user_id AND status = 'pending';

  SELECT name INTO v_requester_name FROM profiles
  WHERE id = (SELECT requester_id FROM disconnect_requests WHERE requestee_id = v_user_id AND status = 'rejected' LIMIT 1);

  RETURN jsonb_build_object('success', true, 'requester_name', v_requester_name);
END;
$$;

-- Create locations table
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own location"
  ON locations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their partner's location"
  ON locations FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT partner_id FROM profiles WHERE id = locations.user_id
    )
  );

CREATE POLICY "Users can upsert their own location"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own location"
  ON locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
