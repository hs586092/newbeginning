-- 프로필 생성 권한 문제 해결을 위한 SQL
-- Supabase SQL Editor에서 실행하세요

-- 1. 현재 profiles 테이블 RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 2. profiles 테이블에 full_name 컬럼 추가 (없다면)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 3. 기존 INSERT 정책 삭제 후 재생성 (권한 문제 해결)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 4. 새로운 INSERT 정책 생성 (더 명확한 권한)
CREATE POLICY "Enable insert for authenticated users on own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 5. SELECT 정책 확인 및 재생성 (혹시 문제가 있다면)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- 6. UPDATE 정책 확인 및 재생성
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 7. 정책 적용 확인
SELECT 'Profile RLS policies updated successfully!' as status;

-- 8. 테스트용 프로필 생성 권한 확인 쿼리
-- (실제로는 애플리케이션에서 실행됨)
SELECT 'Ready for user signup testing' as message;