-- posts 테이블의 제약 조건 확인
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.posts'::regclass 
  AND contype = 'c';

-- 테이블 구조도 확인
\d posts;