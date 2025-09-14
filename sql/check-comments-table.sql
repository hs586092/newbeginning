-- 댓글 관련 테이블이 이미 존재하는지 확인
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('comments', 'comment_likes')
ORDER BY table_name;

-- 만약 테이블이 존재한다면 구조 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('comments', 'comment_likes')
ORDER BY table_name, ordinal_position;