/*
  # Fix Sound Upload Policies

  1. Changes
    - Update RLS policies for sounds table to properly handle inserts
    - Add storage bucket policies for sounds

  2. Security
    - Enable proper authentication checks for sound uploads
    - Ensure storage permissions align with database permissions
*/

-- Update the insert policy for the sounds table
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON sounds;
CREATE POLICY "Enable insert for authenticated users only" 
ON sounds 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create storage policies for the sounds bucket
BEGIN;
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;

  -- Create policy to allow authenticated users to upload
  CREATE POLICY "Allow authenticated uploads"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'sounds' AND
    auth.role() = 'authenticated'
  );

  -- Create policy to allow public downloads
  CREATE POLICY "Allow public downloads"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'sounds');
COMMIT;