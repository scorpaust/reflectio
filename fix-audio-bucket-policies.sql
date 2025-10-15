-- Fix RLS policies for existing audio-posts bucket

-- First, drop any existing policies that might be conflicting
DROP POLICY IF EXISTS "Anyone can view audio files" ON storage.objects;
DROP POLICY IF EXISTS "Public audio access" ON storage.objects;
DROP POLICY IF EXISTS "Audio files are publicly accessible" ON storage.objects;

-- Create a simple public read policy for audio-posts bucket
CREATE POLICY "Public read access for audio files" ON storage.objects
FOR SELECT USING (bucket_id = 'audio-posts');

-- Ensure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'audio-posts';

-- Alternative: If the above doesn't work, try this more permissive policy
-- CREATE POLICY "Allow public read audio" ON storage.objects
-- FOR SELECT USING (bucket_id = 'audio-posts' AND auth.role() IS NOT NULL OR auth.role() IS NULL);