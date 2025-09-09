-- Comments 테이블 상세 디버깅 (수정버전)

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

-- 3. RLS 활성화 상태 확인 (수정)
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'comments';

-- 4. 현재 활성 RLS 정책 확인
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'comments';

-- 5. 간단한 권한 테스트
-- 먼저 RLS를 일시적으로 비활성화해서 테스트
-- (주의: 이건 테스트용이므로 나중에 다시 활성화해야 함)
SELECT 'RLS 테스트 시작' as step;

-- RLS 비활성화
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- 데이터 조회 테스트
SELECT COUNT(*) as count_without_rls FROM comments;

-- RLS 다시 활성화
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

SELECT 'RLS 테스트 완료' as step;