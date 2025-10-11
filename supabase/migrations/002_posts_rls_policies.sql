-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own posts
CREATE POLICY "Users can insert their own posts"
ON posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Policy: Users can view published posts
CREATE POLICY "Users can view published posts"
ON posts
FOR SELECT
TO authenticated
USING (status = 'published');

-- Policy: Users can view their own drafts
CREATE POLICY "Users can view their own drafts"
ON posts
FOR SELECT
TO authenticated
USING (auth.uid() = author_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update their own posts"
ON posts
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
ON posts
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);
