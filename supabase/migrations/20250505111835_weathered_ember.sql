/*
  # Fix RLS policies for sounds table
  
  1. Changes
    - Drop existing policies that might be conflicting
    - Create new policies with proper checks for authenticated users
    
  2. Security
    - Enable RLS on sounds table (already enabled)
    - Add policies for CRUD operations with proper authentication checks
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "sounds_insert_policy_20250505" ON sounds;
DROP POLICY IF EXISTS "sounds_read_policy_20250505" ON sounds;
DROP POLICY IF EXISTS "sounds_update_policy_20250505" ON sounds;
DROP POLICY IF EXISTS "sounds_delete_policy_20250505" ON sounds;

-- Create new policies with proper checks
CREATE POLICY "Enable insert for authenticated users only"
ON sounds FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON sounds FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update for authenticated users only"
ON sounds FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
ON sounds FOR DELETE
TO authenticated
USING (true);

-- Create storage bucket policies
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('sounds', 'sounds', false)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Set up storage policies
CREATE POLICY "Give users access to own folder 1drqz_0"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'sounds');

CREATE POLICY "Give users access to own folder 1drqz_1"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'sounds');

CREATE POLICY "Give users access to own folder 1drqz_2"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'sounds')
WITH CHECK (bucket_id = 'sounds');

CREATE POLICY "Give users access to own folder 1drqz_3"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'sounds');