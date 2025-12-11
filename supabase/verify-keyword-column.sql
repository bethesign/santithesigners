-- Verify keyword column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'gifts'
ORDER BY ordinal_position;
