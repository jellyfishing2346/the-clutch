-- =============================================
-- Migration 006: Image Upload for Tasks and Profiles
-- =============================================

-- ─── ADD IMAGE COLUMNS ───────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ─── TASK IMAGES STORAGE BUCKET ───────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('task-images', 'task-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for task images
DROP POLICY IF EXISTS "task_images_public_read" ON storage.objects;
CREATE POLICY "task_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-images');

DROP POLICY IF EXISTS "task_images_user_insert" ON storage.objects;
CREATE POLICY "task_images_user_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-images'
  AND auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "task_images_user_update" ON storage.objects;
CREATE POLICY "task_images_user_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'task-images'
  AND auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "task_images_user_delete" ON storage.objects;
CREATE POLICY "task_images_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-images'
  AND auth.uid() IS NOT NULL
);
