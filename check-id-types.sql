-- Posts 테이블과 Comments 테이블 ID 타입 일치 확인

-- 1. Posts 테이블 ID 타입 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'posts' 
AND column_name = 'id';

-- 2. Comments 테이블 post_id 타입 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'comments' 
AND column_name = 'post_id';

-- 3. 실제 posts 데이터 샘플 확인 (ID 형식 확인)
SELECT id, title, created_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 5;