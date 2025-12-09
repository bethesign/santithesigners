-- Secret Santa 2024 - Supabase Storage Policies for "santagift" bucket
-- Esegui questo script nel SQL Editor di Supabase

-- ============================================
-- STORAGE POLICIES for "santagift" bucket
-- ============================================

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'santagift'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'santagift'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'santagift'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'santagift'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read files of their gift giver (after reveal)
CREATE POLICY "Users can read received gift files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'santagift'
  AND EXISTS (
    SELECT 1 FROM extraction
    WHERE extraction.receiver_id = auth.uid()
      AND extraction.revealed_at IS NOT NULL
      AND (storage.foldername(name))[1] = extraction.user_id::text
  )
);

-- Policy: Admins can read all files
CREATE POLICY "Admins can read all files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'santagift'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can manage all files
CREATE POLICY "Admins can manage all files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'santagift'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- VERIFICA POLICIES
-- ============================================

-- Query per verificare le policies create
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

SELECT 'Storage policies for santagift bucket created successfully!' as status;
