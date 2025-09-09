-- Comments 테이블 RLS 정책 확인 및 수정

-- 1. 현재 RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'comments';

-- 2. Comments 테이블 존재 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'comments' 
AND table_schema = 'public';

-- 3. 테이블에 RLS가 활성화되어 있는지 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'comments';