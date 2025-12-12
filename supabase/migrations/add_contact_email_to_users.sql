-- Add contact_email column to users table
-- This is the personal email address for being contacted (different from login email)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

COMMENT ON COLUMN users.contact_email IS 'Personal contact email address (different from login email, used by gift senders to contact recipient)';
