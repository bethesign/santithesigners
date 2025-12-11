-- ============================================
-- ADD KEYWORD COLUMN AND RELOAD SCHEMA
-- ============================================

-- 1. Add keyword column if not exists
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS keyword TEXT;

-- 2. Verify column was added
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'gifts'
  AND column_name = 'keyword';

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 4. Confirmation
SELECT '✅ Keyword column added and schema cache reloaded!' as status;
