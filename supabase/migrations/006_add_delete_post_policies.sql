-- Add RLS policies for deleting posts
-- Users can only delete their own posts

-- Enable RLS on posts table if not already enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy for users to delete their own posts
CREATE POLICY "Users can delete their own posts" ON posts
FOR DELETE USING (
  auth.uid() = author_id
);

-- Policy for users to select posts (needed for the delete operation to work)
CREATE POLICY "Users can view all published posts" ON posts
FOR SELECT USING (
  status = 'published' OR auth.uid() = author_id
);

-- Policy for users to insert their own posts
CREATE POLICY "Users can insert their own posts" ON posts
FOR INSERT WITH CHECK (
  auth.uid() = author_id
);

-- Policy for users to update their own posts
CREATE POLICY "Users can update their own posts" ON posts
FOR UPDATE USING (
  auth.uid() = author_id
) WITH CHECK (
  auth.uid() = author_id
);