-- Supabase Best Practice: 회원가입 시 자동 프로필 생성 트리거
-- 이 방식이 공식 권장사항입니다

-- 1. profiles 테이블에 full_name 컬럼 추가 (없다면)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 2. RLS 정책 재설정 (올바른 방식)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 기존 정책 정리
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users on own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow all authenticated users to manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anyone to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role full access" ON public.profiles;

-- RLS 다시 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 올바른 RLS 정책 생성
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. 자동 프로필 생성 함수 (Supabase Best Practice)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 트리거 생성 (회원가입 시 자동 프로필 생성)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. 실시간 구독 설정
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

SELECT 'Supabase Auth Trigger Setup Complete!' as status,
       'Profiles will be created automatically on signup' as message;