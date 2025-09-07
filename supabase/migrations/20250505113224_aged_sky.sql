-- Create the default user with existence check
DO $$
DECLARE
  new_user_id uuid;
  user_email text := 'ton.band@soundscheduler.local';
BEGIN
  -- Check if user exists and get ID if it does
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = user_email;

  -- Only create user if they don't exist
  IF new_user_id IS NULL THEN
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
      user_email,
      crypt('ton.band', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"ton.band"}',
      false
    )
    RETURNING id INTO new_user_id;

    -- Create identity for the new user
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
      new_user_id,
      new_user_id,
      json_build_object('sub', new_user_id::text, 'email', user_email),
      'email',
      user_email,
      now(),
      now(),
      now()
    );
  END IF;
END $$;