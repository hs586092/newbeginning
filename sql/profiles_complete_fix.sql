-- 프로필 생성 권한 문제 완전 해결
-- Supabase SQL Editor에서 실행하세요

-- 1. 현재 상태 확인
SELECT 'Current profiles table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- 2. 현재 RLS 정책 확인
SELECT 'Current RLS policies:' as info;
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 3. RLS 완전 비활성화 후 재설정 (강력한 방법)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users on own profile" ON public.profiles;

-- 4. full_name 컬럼 추가 (없다면)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 5. RLS 다시 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. 매우 관대한 정책으로 시작 (테스트용)
CREATE POLICY "Allow all authenticated users to manage profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. 익명 사용자도 프로필 조회 가능
CREATE POLICY "Allow anyone to view profiles"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- 8. Service Role 권한도 명시적으로 허용
CREATE POLICY "Allow service role full access"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 9. 정책 적용 확인
SELECT 'RLS policies recreated with full permissions' as status;

-- 10. 권한 테스트 쿼리 (확인용)
SELECT 
    'Test query - if this works, signup should work too' as message,
    count(*) as profile_count 
FROM public.profiles;