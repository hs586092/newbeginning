-- Check current category constraint and allowed values
SELECT 
  conname as constraint_name,
  consrc as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%category%' 
  AND conrelid = 'posts'::regclass;

-- Also check what categories are actually being used in the code
-- Based on the PostForm analysis, the categories should be:
-- 'community', 'expecting', 'newborn', 'toddler', 'expert'

-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'category';

-- Show existing data to understand current categories
SELECT DISTINCT category, COUNT(*) 
FROM posts 
GROUP BY category;