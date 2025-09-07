/*
  # Update sound and storage policies

  1. Changes
    - Remove existing policies
    - Create new simplified policies for sounds table
    - Add storage policies for sounds bucket

  2. Security
    - Public read access for sounds and storage
    - Authenticated users can perform all operations
*/

-- Drop all existing policies for sounds table
DROP POLICY IF EXISTS "Enable read access for all users" ON sounds;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON sounds;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON sounds;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON sounds;
DROP POLICY IF EXISTS "Public read access" ON sounds;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON sounds;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON sounds;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON sounds;
DROP POLICY IF EXISTS "Public delete access" ON sounds;
DROP POLICY IF EXISTS "Public update access" ON sounds;
DROP POLICY IF EXISTS "Public write access" ON sounds;

-- Create new policies for sounds with unique names
CREATE POLICY "sounds_public_read"
ON sounds FOR SELECT
TO public
USING (true);

CREATE POLICY "sounds_auth_insert"
ON sounds FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "sounds_auth_update"
ON sounds FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "sounds_auth_delete"
ON sounds FOR DELETE
TO authenticated
USING (true);

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage files" ON storage.objects;

-- Create storage policies with unique names
CREATE POLICY "storage_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'sounds');

CREATE POLICY "storage_auth_all"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'sounds')
WITH CHECK (bucket_id = 'sounds');