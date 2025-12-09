-- Function per controllare se un utente esiste in auth.users
-- SENZA fare login o signup

CREATE OR REPLACE FUNCTION public.check_auth_user_exists(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE email = user_email
  ) INTO user_exists;

  RETURN user_exists;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_auth_user_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_auth_user_exists(TEXT) TO authenticated;
