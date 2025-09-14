-- Comments 테이블 상세 디버깅

-- 1. 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'comments'
ORDER BY ordinal_position;

-- 2. 테이블에 데이터가 있는지 확인
SELECT COUNT(*) as total_comments FROM comments;

-- 3. 샘플 데이터 확인 (있다면)
SELECT * FROM comments LIMIT 3;

-- 4. RLS 활성화 상태 확인
SELECT 
    schemaname, 
    tablename, 
    rowsecurity, 
    hasrls 
FROM pg_tables 
WHERE tablename = 'comments';

-- 5. 현재 사용자 권한 확인
SELECT 
    current_user,
    session_user,
    current_setting('request.jwt.claims', true)::json->'sub' as user_id;

-- 6. 간단한 SELECT 테스트 (RLS 우회)
SELECT 'RLS 테스트 성공' as test_result;