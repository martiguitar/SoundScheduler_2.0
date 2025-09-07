/*
  # Fix schedules RLS policies

  1. Changes
    - Drop existing RLS policies for schedules table
    - Create new policies that properly handle authentication and sound ownership
  
  2. Security
    - Enable RLS on schedules table (already enabled)
    - Add policies for authenticated users to manage their schedules
    - Ensure schedules can only be created for existing sounds
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON schedules;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users" 
ON schedules FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM sounds 
    WHERE sounds.id = schedules.sound_id
  )
);

CREATE POLICY "Enable insert access for authenticated users" 
ON schedules FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sounds 
    WHERE sounds.id = schedules.sound_id
  )
);

CREATE POLICY "Enable update access for authenticated users" 
ON schedules FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM sounds 
    WHERE sounds.id = schedules.sound_id
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM sounds 
    WHERE sounds.id = schedules.sound_id
  )
);

CREATE POLICY "Enable delete access for authenticated users" 
ON schedules FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM sounds 
    WHERE sounds.id = schedules.sound_id
  )
);