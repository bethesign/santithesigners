-- Function to create auth user account from setup page
-- This bypasses client-side email validation issues
-- SECURITY DEFINER allows it to run with elevated privileges

CREATE OR REPLACE FUNCTION public.create_user_account(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  auth_user_exists BOOLEAN;
BEGIN
  -- Check if user already exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = user_email
  ) INTO auth_user_exists;

  IF auth_user_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'user_already_exists',
      'message', 'Un account con questa email esiste già'
    );
  END IF;

  -- Check if user is authorized (exists in public.users)
  SELECT id INTO new_user_id
  FROM public.users
  WHERE email = user_email;

  IF new_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'unauthorized',
      'message', 'Email non autorizzata'
    );
  END IF;

  -- Create auth user using Supabase's internal function
  -- Note: This requires the auth schema extension
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('full_name', user_full_name),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'Account creato con successo'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', 'database_error',
    'message', SQLERRM
  );
END;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_account(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_account(TEXT, TEXT, TEXT) TO authenticated;
