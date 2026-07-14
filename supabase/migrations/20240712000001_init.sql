-- Couple Goals Database Schema
-- Run this in your Supabase SQL Editor

-- No extension needed for gen_random_uuid() in PG 13+

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  pairing_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Statuses table
CREATE TABLE statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  reason_status TEXT CHECK (reason_status IN ('working', 'traveling', 'resting', 'meeting', 'focusing', 'commuting', 'available')),
  emotional_status TEXT CHECK (emotional_status IN ('low_energy', 'need_space', 'miss_you', 'feeling_good', 'stressed', 'grateful', 'loving')),
  custom_reason TEXT,
  is_auto BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schedules table
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_busy BOOLEAN DEFAULT TRUE,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memories table
CREATE TABLE memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX idx_profiles_partner_id ON profiles(partner_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view their partner's profile"
  ON profiles FOR SELECT
  USING (auth.uid() = partner_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for statuses
CREATE POLICY "Users can view their own status"
  ON statuses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their partner's status"
  ON statuses FOR SELECT
  USING (
    auth.uid() IN (
      SELECT partner_id FROM profiles WHERE id = statuses.user_id
    )
  );

CREATE POLICY "Users can upsert their own status"
  ON statuses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own status"
  ON statuses FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for schedules
CREATE POLICY "Users can view their own schedules"
  ON schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their partner's schedules"
  ON schedules FOR SELECT
  USING (
    auth.uid() IN (
      SELECT partner_id FROM profiles WHERE id = schedules.user_id
    )
  );

CREATE POLICY "Users can manage their own schedules"
  ON schedules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for memories
CREATE POLICY "Users can view their own memories"
  ON memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their partner's memories"
  ON memories FOR SELECT
  USING (
    auth.uid() IN (
      SELECT partner_id FROM profiles WHERE id = memories.user_id
    )
  );

CREATE POLICY "Users can insert their own memories"
  ON memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON memories FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

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
