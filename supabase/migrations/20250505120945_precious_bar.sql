/*
  # Add duration column to sounds table
  
  1. Changes
    - Add duration column to sounds table to store audio length in seconds
    
  2. Notes
    - Duration is stored as a decimal number to support millisecond precision if needed
    - Default value is 0 for sounds where duration cannot be determined
*/

ALTER TABLE sounds
ADD COLUMN IF NOT EXISTS duration decimal DEFAULT 0;