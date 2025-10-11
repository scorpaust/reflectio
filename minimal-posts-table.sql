-- Minimal posts table for testing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE content_type AS ENUM ('book', 'film', 'photo', 'thought');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived', 'moderated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create minimal posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type content_type NOT NULL DEFAULT 'thought',
    status post_status NOT NULL DEFAULT 'published',
    sources JSONB,
    is_premium_content BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create minimal profiles table for the join
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    username TEXT,
    avatar_url TEXT,
    current_level INTEGER DEFAULT 1
);