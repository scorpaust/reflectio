-- Create audio-posts bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-posts', 'audio-posts', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for audio-posts bucket
CREATE POLICY "Anyone can view audio files" ON storage.objects
FOR SELECT USING (bucket_id = 'audio-posts');

CREATE POLICY "Authenticated users can upload audio files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'audio-posts' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own audio files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'audio-posts' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own audio files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'audio-posts' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);