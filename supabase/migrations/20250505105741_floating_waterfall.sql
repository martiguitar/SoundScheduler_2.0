/*
  # Update security policies for sounds and storage
  
  1. Security Updates
    - Remove existing policies
    - Create new policies with unique names for sounds table
    - Update storage bucket policies
  
  2. Changes
    - Cleanup all existing policies
    - Add new RLS policies for sounds table
    - Add new storage policies for sounds bucket
*/

-- Drop ALL existing policies for sounds table
DO $$ 
BEGIN
  -- Drop all policies from the sounds table
  EXECUTE (
    SELECT string_agg(
      format('DROP POLICY IF EXISTS %I ON sounds', policyname),
      '; '
    )
    FROM pg_policies 
    WHERE tablename = 'sounds'
  );
END $$;

-- Drop ALL existing policies for storage.objects
DO $$ 
BEGIN
  -- Drop all policies from storage.objects
  EXECUTE (
    SELECT string_agg(
      format('DROP POLICY IF EXISTS %I ON storage.objects', policyname),
      '; '
    )
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
  );
END $$;

-- Create new policies for sounds with timestamp-based unique names
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

-- Create storage policies with timestamp-based unique names
CREATE POLICY "storage_read_policy_20250505"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'sounds');

CREATE POLICY "storage_manage_policy_20250505"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'sounds')
WITH CHECK (bucket_id = 'sounds');