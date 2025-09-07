/*
  # Update storage and RLS policies

  1. Changes
    - Enable RLS on sounds table
    - Add RLS policies for authenticated users to manage sounds
    - Add RLS policies for public read access
    - Add storage policies for the sounds bucket

  2. Security
    - Authenticated users can upload, update, and delete sounds
    - Public users can read sounds
    - Storage policies allow authenticated users to manage files
*/

-- Enable RLS on sounds table
ALTER TABLE sounds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON sounds;
DROP POLICY IF EXISTS "Enable read access for all users" ON sounds;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON sounds;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON sounds;

-- Create new comprehensive policies
CREATE POLICY "Enable insert for authenticated users"
  ON sounds
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
  ON sounds
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable update for authenticated users"
  ON sounds
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON sounds
  FOR DELETE
  TO authenticated
  USING (true);

-- Create storage policies
CREATE POLICY "Authenticated users can upload sounds"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'sounds');

CREATE POLICY "Anyone can read sounds"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'sounds');

CREATE POLICY "Authenticated users can delete sounds"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'sounds');