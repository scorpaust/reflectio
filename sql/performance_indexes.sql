-- Performance optimization indexes for user permissions system
-- These indexes improve query performance for permission-based filtering

-- Index for posts filtering by premium content and author
-- Improves performance of queries that filter posts by is_premium_content
CREATE INDEX IF NOT EXISTS idx_posts_premium_content_author 
ON posts (is_premium_content, author_id, created_at DESC);

-- Index for posts by author and creation date
-- Improves performance when fetching user's posts chronologically
CREATE INDEX IF NOT EXISTS idx_posts_author_created 
ON posts (author_id, created_at DESC);

-- Index for posts by premium content status and creation date
-- Improves performance when filtering public posts
CREATE INDEX IF NOT EXISTS idx_posts_premium_created 
ON posts (is_premium_content, created_at DESC);

-- Index for profiles premium status lookup
-- Improves performance of permission checks
CREATE INDEX IF NOT EXISTS idx_profiles_premium_status 
ON profiles (id, is_premium, premium_expires_at);

-- Index for profiles premium expiration
-- Helps with queries that check premium expiration
CREATE INDEX IF NOT EXISTS idx_profiles_premium_expires 
ON profiles (premium_expires_at) 
WHERE premium_expires_at IS NOT NULL;

-- Index for reflections by post and user
-- Improves performance when checking reflection permissions
CREATE INDEX IF NOT EXISTS idx_reflections_post_author 
ON reflections (post_id, author_id, created_at DESC);

-- Index for connections by users
-- Improves performance of connection permission checks
CREATE INDEX IF NOT EXISTS idx_connections_users 
ON connections (requester_id, addressee_id, status);

-- Index for connections by status and creation date
-- Helps with connection filtering and sorting
CREATE INDEX IF NOT EXISTS idx_connections_status_created 
ON connections (status, created_at DESC);

-- Composite index for posts with profile data (for joins)
-- Improves performance of queries that join posts with profiles
CREATE INDEX IF NOT EXISTS idx_posts_author_premium_content 
ON posts (author_id, is_premium_content, created_at DESC);

-- Index for audit logs (conditional creation)
-- Improves performance of audit queries
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action 
        ON audit_logs (user_id, action, created_at DESC);
    END IF;
END $$;

-- Partial index for active premium users
-- Only indexes users with active premium status
CREATE INDEX IF NOT EXISTS idx_profiles_active_premium 
ON profiles (id, premium_expires_at) 
WHERE is_premium = true;

-- Index for posts visibility queries
-- Optimizes the complex OR queries used in post filtering
CREATE INDEX IF NOT EXISTS idx_posts_visibility 
ON posts (is_premium_content, author_id) 
INCLUDE (created_at, title, content);

-- Statistics update for better query planning
-- This helps PostgreSQL choose better execution plans
ANALYZE posts;
ANALYZE profiles;
ANALYZE reflections;
ANALYZE connections;