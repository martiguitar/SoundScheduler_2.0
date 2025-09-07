-- Create the default user with raw SQL insert
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
  'ton.band@soundscheduler.local',
  crypt('ton.band', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"ton.band"}',
  false
);

-- Create identities record for the user
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
SELECT 
  id,
  id,
  json_build_object('sub', id::text),
  'email',
  email,
  now(),
  now(),
  now()
FROM auth.users
WHERE email = 'ton.band@soundscheduler.local'
AND NOT EXISTS (
  SELECT 1 FROM auth.identities 
  WHERE provider = 'email' 
  AND user_id = auth.users.id
);