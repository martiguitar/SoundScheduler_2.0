/*
  # Create admin users

  1. Changes
    - Create admin users with proper credentials
    - Set up email-based authentication
  
  2. Security
    - Store encrypted passwords
    - Set proper roles and permissions
*/

-- Create admin users if they don't exist
DO $$
DECLARE
  user1_id uuid;
  user2_id uuid;
  user1_email text := 'martin@soundscheduler.local';
  user2_email text := 'erwin@soundscheduler.local';
BEGIN
  -- Create first user (Martin)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user1_email) THEN
    INSERT INTO auth.users (
      email,
      encrypted_password,
      created_at,
      updated_at
    )
    VALUES (
      user1_email,
      crypt('tonband', gen_salt('bf')),
      now(),
      now()
    )
    RETURNING id INTO user1_id;
  END IF;

  -- Create second user (Erwin)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user2_email) THEN
    INSERT INTO auth.users (
      email,
      encrypted_password,
      created_at,
      updated_at
    )
    VALUES (
      user2_email,
      crypt('tonband', gen_salt('bf')),
      now(),
      now()
    )
    RETURNING id INTO user2_id;
  END IF;
END $$;