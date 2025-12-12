-- Add avatar_id column to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_id INTEGER DEFAULT 1;

-- Add comment for clarity
COMMENT ON COLUMN users.avatar_id IS 'ID of the selected avatar/emoji (1-20)';
