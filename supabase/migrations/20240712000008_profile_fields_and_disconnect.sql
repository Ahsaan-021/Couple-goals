-- Add profile fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'custom'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pairing_code_created_by UUID REFERENCES profiles(id);

-- Allow authenticated users to see all profiles for connection
CREATE POLICY "Users can view profiles for connection"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Function to disconnect partners
CREATE OR REPLACE FUNCTION public.disconnect_partner()
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

  -- Remove partner connection from both
  UPDATE profiles SET partner_id = NULL WHERE id IN (v_user_id, v_partner_id);
  
  RETURN jsonb_build_object('success', true, 'partner_name', v_partner_name);
END;
$$;

-- Update link_partner to track who created the pairing code
CREATE OR REPLACE FUNCTION public.link_partner(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_partner_id UUID;
  v_partner_name TEXT;
  v_code_creator UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Find partner by pairing code, ensure it's not self
  SELECT id, name INTO v_partner_id, v_partner_name
  FROM profiles
  WHERE pairing_code = p_code AND id != v_user_id;

  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No partner found with that code');
  END IF;

  -- Get the code creator
  SELECT pairing_code_created_by INTO v_code_creator FROM profiles WHERE id = v_partner_id;

  -- Update both profiles
  UPDATE profiles SET partner_id = v_partner_id WHERE id = v_user_id;
  UPDATE profiles SET partner_id = v_user_id WHERE id = v_partner_id;

  -- Clear both pairing codes
  UPDATE profiles SET pairing_code = NULL WHERE id IN (v_user_id, v_partner_id);

  RETURN jsonb_build_object('success', true, 'partner_name', v_partner_name, 'code_creator', v_code_creator);
END;
$$;

-- Update handle_new_user to set pairing_code_created_by
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, pairing_code_created_by)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
