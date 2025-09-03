-- Best Practice: Database Trigger 진단 및 완전 재설정
-- Supabase SQL Editor에서 실행하세요

-- ========================================
-- STEP 1: 현재 상태 진단
-- ========================================

-- 트리거 존재 여부 확인
SELECT 'TRIGGER DIAGNOSIS:' as step;
SELECT trigger_name, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 함수 존재 여부 확인
SELECT 'FUNCTION DIAGNOSIS:' as step;
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- profiles 테이블 구조 확인
SELECT 'PROFILES TABLE STRUCTURE:' as step;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 현재 사용자 vs 프로필 상태
SELECT 'USER vs PROFILE STATUS:' as step;
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)) as users_without_profiles;

-- ========================================
-- STEP 2: 완전 재설정 (Best Practice)
-- ========================================

-- 기존 트리거 및 함수 완전 제거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- profiles 테이블에 필요한 컬럼 추가 (안전하게)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 새로운 프로필 생성 함수 (에러 핸들링 포함)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 프로필 생성 시도
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'username', 
      split_part(new.email, '@', 1),
      'user_' || substr(new.id::text, 1, 8)
    ),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- 성공 로그
  RAISE LOG 'Profile created successfully for user: %', new.id;
  RETURN new;
  
EXCEPTION WHEN OTHERS THEN
  -- 에러 발생 시 로그만 남기고 회원가입은 계속 진행
  RAISE LOG 'Error creating profile for user %: % (SQLSTATE: %)', new.id, SQLERRM, SQLSTATE;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (회원가입 시 자동 실행)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- STEP 3: RLS 정책 재정비 (올바른 권한 설정)
-- ========================================

-- RLS 정책 정리
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 올바른 RLS 정책 재생성
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- INSERT는 트리거에서만 하므로 제거 (보안 강화)
-- 일반 사용자는 INSERT 권한 불필요

-- ========================================
-- STEP 4: 기존 프로필 없는 사용자 처리
-- ========================================

-- 기존 가입 사용자 중 프로필이 없는 경우 자동 생성
INSERT INTO public.profiles (id, username, full_name, avatar_url)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'username', 
    split_part(u.email, '@', 1),
    'user_' || substr(u.id::text, 1, 8)
  ) as username,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users u 
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- STEP 5: 설정 완료 확인
-- ========================================

SELECT 'SETUP COMPLETE!' as status;

-- 최종 상태 확인
SELECT 
  'Final Status:' as info,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)) as users_without_profiles;

-- 트리거 설정 확인
SELECT 'Trigger Status:' as info;
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

SELECT 'Ready for signup testing!' as message;