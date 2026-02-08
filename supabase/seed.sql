-- supabase/seed.sql

-- Create admin user (trigger will create profile)
DO $$
DECLARE
  admin_id uuid;
  user_id uuid;
BEGIN
  -- Create admin user
  admin_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_sent_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    'admin@bean-counter.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    NOW()
  );

  -- Update admin profile with role and name
  UPDATE public.profiles
  SET 
    role = 'admin',
    first_name = 'Admin',
    last_name = 'User'
  WHERE id = admin_id;

  -- Create regular user
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_sent_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    'user@bean-counter.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    NOW()
  );

  -- Update regular user profile with role and name
  UPDATE public.profiles
  SET 
    role = 'user',
    first_name = 'Regular',
    last_name = 'User'
  WHERE id = user_id;
END $$;