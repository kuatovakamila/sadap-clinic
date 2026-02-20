-- ============================================
-- Supabase Storage RLS Policies for Public Access
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Make sure buckets exist and are public
-- (You can also do this via UI: Storage → Settings → Make bucket public)

-- 2. Create policies for PUBLIC READ access to doctors bucket
-- This allows anyone (including unauthenticated users) to view doctor avatars

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public Access to doctors bucket" ON storage.objects;

-- Create new policy for public read access
CREATE POLICY "Public Access to doctors bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'doctors');

-- 3. Create policies for PUBLIC READ access to services bucket
-- This allows anyone to view service images

DROP POLICY IF EXISTS "Public Access to services bucket" ON storage.objects;

CREATE POLICY "Public Access to services bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'services');

-- 4. Optional: If you have other buckets, add similar policies
-- Example for 'equipment' bucket:
-- DROP POLICY IF EXISTS "Public Access to equipment bucket" ON storage.objects;
-- CREATE POLICY "Public Access to equipment bucket"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'equipment');

-- 5. Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. Make sure your buckets are set to "public" in the UI:
--    Storage → [Your Bucket] → Settings → Public bucket: ON
--
-- 2. Image URLs should be stored in database as full URLs:
--    https://qjealtvlmkusxeuymdpx.supabase.co/storage/v1/object/public/doctors/avatar.jpg
--
-- 3. Test access by opening an image URL directly in incognito browser
--
-- 4. If images still don't load, check:
--    - Bucket is public
--    - File paths in database are correct
--    - CORS settings in Supabase (usually automatic for public buckets)
