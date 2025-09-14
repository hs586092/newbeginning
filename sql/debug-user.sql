-- 현재 로그인 상태 및 사용자 정보 확인
SELECT 
    auth.uid() as current_user_id,
    auth.jwt() ->> 'email' as current_email,
    CASE WHEN auth.uid() IS NULL THEN 'Not logged in' ELSE 'Logged in' END as login_status;

-- auth.users 테이블 확인 (가능한 경우)
-- SELECT id, email, created_at FROM auth.users LIMIT 5;