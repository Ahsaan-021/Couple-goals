-- Allow users to search by pairing code (for connection flow)
CREATE POLICY "Users can search profiles by pairing code"
  ON profiles FOR SELECT
  TO authenticated
  USING (pairing_code IS NOT NULL);

-- Function to link two profiles as partners
-- Called by either user with the other's pairing code
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

  -- Update both profiles
  UPDATE profiles SET partner_id = v_partner_id WHERE id = v_user_id;
  UPDATE profiles SET partner_id = v_user_id WHERE id = v_partner_id;

  -- Clear both pairing codes
  UPDATE profiles SET pairing_code = NULL WHERE id IN (v_user_id, v_partner_id);

  RETURN jsonb_build_object('success', true, 'partner_name', v_partner_name);
END;
$$;
