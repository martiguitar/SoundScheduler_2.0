/*
  # Add RLS policies for schedules table

  1. Security
    - Enable RLS on schedules table
    - Add policies for authenticated users to:
      - Insert new schedules
      - Read their schedules
      - Update their schedules
      - Delete their schedules
*/

-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Policy for inserting schedules
CREATE POLICY "Users can insert their own schedules"
ON schedules
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sounds
    WHERE id = sound_id
  )
);

-- Policy for reading schedules
CREATE POLICY "Users can read schedules"
ON schedules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sounds
    WHERE id = sound_id
  )
);

-- Policy for updating schedules
CREATE POLICY "Users can update their own schedules"
ON schedules
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sounds
    WHERE id = sound_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sounds
    WHERE id = sound_id
  )
);

-- Policy for deleting schedules
CREATE POLICY "Users can delete their own schedules"
ON schedules
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sounds
    WHERE id = sound_id
  )
);