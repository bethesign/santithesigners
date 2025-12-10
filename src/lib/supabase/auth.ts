import { supabase } from './client';

/**
 * Check if an email exists in the users table (pre-authorized users)
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .maybeSingle();

  // maybeSingle returns null if no row found (no error)
  if (error) {
    console.error('Error checking email:', error);
    return false;
  }

  return !!data;
}

/**
 * Get user data from public.users table by auth user ID
 */
export async function getUserData(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }

  return data;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking admin role:', error);
    return false;
  }

  return data?.role === 'admin';
}

/**
 * Update user password (for first access setup)
 */
export async function updateUserPassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  return { error };
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  return user;
}
