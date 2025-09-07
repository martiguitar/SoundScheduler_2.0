/*
  # Update policies for sounds and storage
  
  1. Changes
    - Remove all existing policies from sounds table
    - Create new timestamped policies for sounds table
    - Remove all existing policies from storage.objects
    - Create new timestamped policies for storage.objects
  
  2. Security
    - Public read access for sounds and storage
    - Authenticated users can perform all operations
    - Storage operations restricted to 'sounds' bucket
*/

-- Drop existing policies for sounds table
DROP POLICY IF EXISTS "sounds_read_policy_20250505" ON sounds;
DROP POLICY IF EXISTS "sounds_insert_policy_20250505" ON sounds;
DROP POLICY IF EXISTS "sounds_update_policy_20250505" ON sounds;
DROP POLICY IF EXISTS "sounds_delete_policy_20250505" ON sounds;
DROP POLICY IF EXISTS "Public read access" ON sounds;
DROP POLICY IF EXISTS "Authenticated users can insert" ON sounds;
DROP POLICY IF EXISTS "Authenticated users can update" ON sounds;
DROP POLICY IF EXISTS "Authenticated users can delete" ON sounds;

-- Create new policies for sounds with timestamped names
CREATE POLICY "sounds_read_policy_20250505"
ON sounds FOR SELECT
TO public
USING (true);

CREATE POLICY "sounds_insert_policy_20250505"
ON sounds FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "sounds_update_policy_20250505"
ON sounds FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "sounds_delete_policy_20250505"
ON sounds FOR DELETE
TO authenticated
USING (true);

-- Drop existing storage policies
DROP POLICY IF EXISTS "storage_read_policy_20250505" ON storage.objects;
DROP POLICY IF EXISTS "storage_all_policy_20250505" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage files" ON storage.objects;

-- Create new storage policies with timestamped names
CREATE POLICY "storage_read_policy_20250505"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'sounds');

CREATE POLICY "storage_all_policy_20250505"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'sounds')
WITH CHECK (bucket_id = 'sounds');