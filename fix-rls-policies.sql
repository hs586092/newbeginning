-- Fix RLS Policies for Posts Table
-- This script will set up proper RLS policies for authenticated users only

-- First, let's check current policies (run this to see existing policies)
SELECT 
  schemaname,
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'posts';

-- Drop any existing conflicting policies (run if needed)
-- DROP POLICY IF EXISTS "Allow anonymous inserts" ON posts;
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON posts;
-- DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
-- DROP POLICY IF EXISTS "Enable update for users based on user_id" ON posts;
-- DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON posts;

-- 1. Allow authenticated users to insert their own posts
CREATE POLICY "Enable insert for authenticated users" ON posts
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Allow everyone to read posts (public read access)
CREATE POLICY "Enable read access for all users" ON posts
FOR SELECT 
USING (true);

-- 3. Allow users to update their own posts only
CREATE POLICY "Enable update for users based on user_id" ON posts
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to delete their own posts only
CREATE POLICY "Enable delete for users based on user_id" ON posts
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Check the results
SELECT 'Policies created successfully. Check the policies above.' as status;