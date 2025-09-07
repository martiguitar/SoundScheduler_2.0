/*
  # Fix schedules table RLS policies

  1. Changes
    - Drop existing RLS policies for schedules table
    - Create new RLS policies with proper authentication checks
    - Ensure policies work correctly for all CRUD operations

  2. Security
    - Enable RLS on schedules table
    - Add policies for authenticated users only
    - Maintain referential integrity with sounds table
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON schedules;

-- Create new policies
CREATE POLICY "Enable read for authenticated users"
ON schedules FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON schedules FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM sounds
    WHERE sounds.id = sound_id
  )
);

CREATE POLICY "Enable update for authenticated users"
ON schedules FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM sounds
    WHERE sounds.id = sound_id
  )
);

CREATE POLICY "Enable delete for authenticated users"
ON schedules FOR DELETE
TO authenticated
USING (true);