/*
  # Fix RLS policies for schedules table

  1. Changes
    - Drop all existing policies to avoid conflicts
    - Create new simplified policies for authenticated users
    - Maintain referential integrity with sounds table
    - Enable full CRUD access for authenticated users

  2. Security
    - All operations require authentication
    - Insert/Update operations verify sound_id exists
    - No row-level filtering based on user_id (all authenticated users can access all schedules)
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON schedules;

-- Create new simplified policies
CREATE POLICY "Enable read access for all authenticated users"
ON schedules FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON schedules FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM sounds
    WHERE id = sound_id
  )
);

CREATE POLICY "Enable update access for authenticated users"
ON schedules FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM sounds
    WHERE id = sound_id
  )
);

CREATE POLICY "Enable delete access for authenticated users"
ON schedules FOR DELETE
TO authenticated
USING (true);