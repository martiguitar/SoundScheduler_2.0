/*
  # Add RLS policies for sounds table

  1. Changes
    - Enable RLS on sounds table
    - Add policies for CRUD operations:
      - INSERT for authenticated users
      - UPDATE for authenticated users
      - DELETE for authenticated users
      - SELECT for public access

  2. Security
    - Enables row level security
    - Restricts write operations to authenticated users
    - Allows public read access
*/

-- Enable RLS on sounds table if not already enabled
ALTER TABLE sounds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON sounds;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON sounds;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON sounds;
DROP POLICY IF EXISTS "Enable read access for all users" ON sounds;

-- Create comprehensive policies for sounds table
CREATE POLICY "Enable insert for authenticated users only"
ON sounds
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON sounds
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
ON sounds
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Enable read access for all users"
ON sounds
FOR SELECT
TO public
USING (true);