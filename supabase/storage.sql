-- ==============================================================================
-- SCHEMATRIX - Supabase Storage Migration: Private Citizen Document Vault
-- Run AFTER schema.sql. Creates the private `citizen-documents` bucket used by
-- lib/vault.ts and enforces per-user ownership at the storage-object level so
-- one citizen can never read another citizen's uploaded files.
-- ==============================================================================

-- 1. Create the private bucket (idempotent). Private = no public URLs; access is
--    always gated by the storage RLS policies below (and signed URLs).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'citizen-documents',
  'citizen-documents',
  false,
  10485760, -- 10 MB per file
  ARRAY['image/jpeg','image/png','image/webp','application/pdf','image/heic','image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage object RLS: enable and scope every operation to the object owner.
--    Object paths are `${auth.uid()}/${documentId}/${fileName}` (see lib/vault.ts),
--    so `owner` = the first path segment.
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "citizens read own documents" ON storage.objects;
CREATE POLICY "citizens read own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'citizen-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "citizens upload own documents" ON storage.objects;
CREATE POLICY "citizens upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'citizen-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "citizens update own documents" ON storage.objects;
CREATE POLICY "citizens update own documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'citizen-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'citizen-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "citizens delete own documents" ON storage.objects;
CREATE POLICY "citizens delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'citizen-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );