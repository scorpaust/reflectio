-- Add audio fields to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_duration INTEGER,
ADD COLUMN IF NOT EXISTS audio_waveform JSONB,
ADD COLUMN IF NOT EXISTS audio_transcript TEXT;

-- Create index for audio posts
CREATE INDEX IF NOT EXISTS idx_posts_audio_url ON posts(audio_url) WHERE audio_url IS NOT NULL;