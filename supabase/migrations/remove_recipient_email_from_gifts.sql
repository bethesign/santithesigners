-- Remove recipient_email column from gifts table
-- This was incorrectly added - email should be in users table, not gifts

ALTER TABLE gifts
  DROP COLUMN IF EXISTS recipient_email;
