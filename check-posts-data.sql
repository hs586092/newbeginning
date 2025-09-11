-- posts 테이블 데이터 확인
SELECT 
    id,
    author_name,
    title,
    category,
    created_at,
    view_count
FROM posts 
ORDER BY created_at DESC;

-- 총 게시글 수 확인
SELECT COUNT(*) as total_posts FROM posts;