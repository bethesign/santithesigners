-- Secret Santa 2024 - Auth Helper Functions
-- Esegui questo script su Supabase SQL Editor

-- ============================================
-- FUNCTION: Check if email is authorized
-- ============================================

CREATE OR REPLACE FUNCTION public.check_email_authorized(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Esegue con permessi elevati
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Check if email exists in users table
  SELECT id, email, full_name, city, role
  INTO user_record
  FROM public.users
  WHERE email = user_email;

  IF NOT FOUND THEN
    -- Email not authorized
    RETURN json_build_object(
      'authorized', false,
      'message', 'Email non autorizzata'
    );
  END IF;

  -- Email authorized - return user info (but not sensitive data)
  RETURN json_build_object(
    'authorized', true,
    'user_id', user_record.id,
    'email', user_record.email,
    'full_name', user_record.full_name,
    'city', user_record.city,
    'role', user_record.role
  );
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.check_email_authorized(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_authorized(TEXT) TO authenticated;

-- ============================================
-- FUNCTION: Link auth user to public user
-- ============================================

CREATE OR REPLACE FUNCTION public.link_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When a new auth user is created, link it to the corresponding user in public.users
  UPDATE public.users
  SET id = NEW.id
  WHERE email = NEW.email;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_auth_user();

-- ============================================
-- TEST QUERIES
-- ============================================

-- Test the function
SELECT public.check_email_authorized('admin@thesigners.it');

-- Should return:
-- {
--   "authorized": true,
--   "user_id": "...",
--   "email": "admin@thesigners.it",
--   "full_name": "Admin User",
--   "city": "Milano",
--   "role": "admin"
-- }

SELECT public.check_email_authorized('notauthorized@example.com');

-- Should return:
-- {
--   "authorized": false,
--   "message": "Email non autorizzata"
-- }

-- ============================================
-- NOTES
-- ============================================

/*
USAGE FROM FRONTEND:

const { data, error } = await supabase.rpc('check_email_authorized', {
  user_email: 'admin@thesigners.it'
});

if (data.authorized) {
  console.log('User is authorized:', data.full_name);
} else {
  console.log('Not authorized:', data.message);
}
*/
