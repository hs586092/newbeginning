-- Add missing columns to posts table
-- Run this in Supabase SQL Editor

-- 1. Add baby_month column (age in months)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS baby_month INTEGER CHECK (baby_month >= 0 AND baby_month <= 36);

-- 2. Add is_question column (boolean flag for questions)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_question BOOLEAN DEFAULT FALSE;

-- 3. Add tags column (array of strings for tags)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 4. Add mood column (mood/feeling when posting)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS mood TEXT;

-- 5. Check the updated table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;