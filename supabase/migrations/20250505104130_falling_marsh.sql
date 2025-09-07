/*
  # Add type constraint to sounds table

  1. Changes
    - Add check constraint to ensure type column only accepts 'music' or 'notification'
    - Uses DO block to check if constraint exists before adding
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'sounds_type_check' 
    AND table_name = 'sounds'
  ) THEN
    ALTER TABLE sounds
    ADD CONSTRAINT sounds_type_check
    CHECK (type IN ('music', 'notification'));
  END IF;
END $$;