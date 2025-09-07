/*
  # Fix schedules table RLS policies

  1. Changes
    - Remove conflicting RLS policies
    - Add new, clearer RLS policies for schedules table
    
  2. Security
    - Enable RLS on schedules table (already enabled)
    - Add policies for authenticated users to manage their schedules
    - Ensure proper relationship checking with sounds table
*/

-- First, drop the conflicting policies
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON schedules;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON schedules;
DROP POLICY IF EXISTS "Enable read access for all users" ON schedules;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON schedules;
DROP POLICY IF EXISTS "Users can delete their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can insert their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can read schedules" ON schedules;
DROP POLICY IF EXISTS "Users can update their own schedules" ON schedules;

-- Create new, cleaner policies
CREATE POLICY "Enable read for authenticated users"
ON schedules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sounds 
    WHERE sounds.id = schedules.sound_id
  )
);

CREATE POLICY "Enable insert for authenticated users"
ON schedules
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sounds 
    WHERE sounds.id = schedules.sound_id
  )
);

CREATE POLICY "Enable update for authenticated users"
ON schedules
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sounds 
    WHERE sounds.id = schedules.sound_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sounds 
    WHERE sounds.id = schedules.sound_id
  )
);

CREATE POLICY "Enable delete for authenticated users"
ON schedules
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sounds 
    WHERE sounds.id = schedules.sound_id
  )
);