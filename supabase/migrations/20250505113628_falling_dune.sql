/*
  # Create admin users

  1. New Users
    - Martin (martin@soundscheduler.local)
    - Erwin (erwin@soundscheduler.local)
    Both users will have admin privileges

  2. Security
    - Users are created with encrypted passwords
    - Email confirmation is disabled
    - Users are created with authenticated role
*/

DO $$
DECLARE
  user1_id uuid;
  user2_id uuid;
  user1_email text := 'martin@soundscheduler.local';
  user2_email text := 'erwin@soundscheduler.local';
BEGIN
  -- Create first user (Martin) if they don't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user1_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      user1_email,
      crypt('tonband', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"martin"}',
      true
    )
    RETURNING id INTO user1_id;

    -- Create identity for Martin
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      user1_id,
      user1_id,
      json_build_object('sub', user1_id::text, 'email', user1_email),
      'email',
      user1_email,
      now(),
      now(),
      now()
    );
  END IF;

  -- Create second user (Erwin) if they don't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user2_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      user2_email,
      crypt('tonband', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"erwin"}',
      true
    )
    RETURNING id INTO user2_id;

    -- Create identity for Erwin
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      user2_id,
      user2_id,
      json_build_object('sub', user2_id::text, 'email', user2_email),
      'email',
      user2_email,
      now(),
      now(),
      now()
    );
  END IF;
END $$;