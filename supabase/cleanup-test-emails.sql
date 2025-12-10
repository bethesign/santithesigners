-- ============================================
-- Cleanup Script for Test Email Accounts
-- ============================================
-- Purpose: Remove test accounts with fake @thesigners.it emails
--          that may have caused Supabase email bounces
--
-- WARNING: This will permanently delete these accounts
-- Only run if you're certain these are test accounts
--
-- How to run:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Paste this script
-- 3. Run with service_role permissions (or as admin)
-- ============================================

-- Step 1: Delete from public.users table
DELETE FROM public.users
WHERE email LIKE '%@thesigners.it';

-- Step 2: Delete from auth.users table (requires elevated permissions)
-- This removes the authentication records
-- Note: You may need to run this part separately with service_role key
DELETE FROM auth.users
WHERE email LIKE '%@thesigners.it';

-- ============================================
-- Verification Queries
-- ============================================

-- Check if any test emails remain in public.users
SELECT 'public.users check' as table_name, email
FROM public.users
WHERE email LIKE '%@thesigners.it';
-- Expected: 0 rows

-- Check if any test emails remain in auth.users
SELECT 'auth.users check' as table_name, email
FROM auth.users
WHERE email LIKE '%@thesigners.it';
-- Expected: 0 rows

-- Summary
SELECT
  'Cleanup complete!' as status,
  (SELECT COUNT(*) FROM public.users) as total_users_remaining,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users_remaining;

-- ============================================
-- Notes
-- ============================================
-- After running this cleanup:
-- 1. Verify email confirmation is disabled in Supabase Dashboard
--    → Authentication → Providers → Email → Confirm email (OFF)
--
-- 2. Only add real email addresses to seed.sql going forward
--
-- 3. For testing, use your own valid email addresses
--
-- This should resolve the Supabase bounce rate warning
-- ============================================
