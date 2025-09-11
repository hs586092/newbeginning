SELECT 
  id,
  post_id,
  parent_comment_id,
  author_name,
  content,
  is_deleted,
  created_at
FROM comments 
ORDER BY created_at DESC 
LIMIT 10;