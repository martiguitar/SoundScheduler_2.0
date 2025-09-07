/*
  # Create sounds and schedules tables with RLS policies

  1. New Tables
    - `sounds`: Stores audio file metadata and URLs
    - `schedules`: Stores playback schedules for sounds

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
    - Authenticated users can manage their data
    - Public read access for all users

  3. Triggers
    - Add updated_at triggers for both tables
*/

-- Create sounds table
CREATE TABLE IF NOT EXISTS sounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  file_path text NOT NULL,
  size bigint,
  type text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sound_id uuid REFERENCES sounds(id) ON DELETE CASCADE,
  time text NOT NULL,
  active boolean DEFAULT true,
  last_played timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop sounds policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON sounds;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON sounds;
  DROP POLICY IF EXISTS "Enable update for authenticated users only" ON sounds;
  DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON sounds;
  
  -- Drop schedules policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON schedules;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON schedules;
  DROP POLICY IF EXISTS "Enable update for authenticated users only" ON schedules;
  DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON schedules;
END $$;

-- Create policies for sounds
CREATE POLICY "Enable read access for all users"
  ON sounds FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON sounds FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
  ON sounds FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
  ON sounds FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for schedules
CREATE POLICY "Enable read access for all users"
  ON schedules FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
  ON schedules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
  ON schedules FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_sounds_updated_at ON sounds;
CREATE TRIGGER update_sounds_updated_at
  BEFORE UPDATE ON sounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();