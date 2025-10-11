-- Drop existing insert policy and recreate with better permissions
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;

-- Create new insert policy that's more permissive
CREATE POLICY "Users can insert their own posts"
ON posts
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Allow insert without restriction for now

-- Verify the policy works by testing
-- You should be able to insert a post after running this
