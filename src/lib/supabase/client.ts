import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iqsghoezjqoqsnggtkgx.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc2dob2V6anFvcXNuZ2d0a2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDI2NjgsImV4cCI6MjA4MDc3ODY2OH0.2JAbjWCsCnYApqH0RNTQ1H3UCTHckod3Ke6VTQUuyo4'

export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)

export function createClient() {
  return supabase
}
