/*
  # Add updated_at column to sounds table

  1. Changes
    - Add `updated_at` column to sounds table with default value of current timestamp
    - Column will be automatically updated by existing trigger
*/

-- Add updated_at column to sounds table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'sounds' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE sounds 
    ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;