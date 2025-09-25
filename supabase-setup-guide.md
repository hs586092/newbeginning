# 🚀 Supabase 데이터베이스 완성 가이드

## 📋 30분 완성 가이드

### 1단계: Supabase 대시보드 접속
**URL**: https://supabase.com/dashboard/project/gwqvqncgveqenzymwlmy/editor

### 2단계: SQL Editor에서 테이블 생성

**복사할 SQL (create-tables-sql.sql)**:

```sql
-- 필수 테이블 생성 스크립트 (단순화된 버전)

-- 1. categories 테이블 생성
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  post_count INTEGER DEFAULT 0,
  is_hot BOOLEAN DEFAULT false,
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. groups 테이블 생성
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  member_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. group_memberships 테이블 생성
CREATE TABLE IF NOT EXISTS public.group_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(group_id, user_id)
);

-- 4. notifications 테이블 생성
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200),
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. follows 테이블 생성
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- profiles 테이블에 추가 컬럼 (이미 존재하는 테이블)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'points') THEN
        ALTER TABLE public.profiles ADD COLUMN points INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'level') THEN
        ALTER TABLE public.profiles ADD COLUMN level INTEGER DEFAULT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ranking') THEN
        ALTER TABLE public.profiles ADD COLUMN ranking INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'next_badge_points') THEN
        ALTER TABLE public.profiles ADD COLUMN next_badge_points INTEGER DEFAULT 250;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'followers_count') THEN
        ALTER TABLE public.profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'following_count') THEN
        ALTER TABLE public.profiles ADD COLUMN following_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_categories_hot ON public.categories(is_hot DESC, post_count DESC);
CREATE INDEX IF NOT EXISTS idx_groups_member_count ON public.groups(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- RLS 정책 설정
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- categories 정책
DROP POLICY IF EXISTS "Everyone can view categories" ON public.categories;
CREATE POLICY "Everyone can view categories" ON public.categories FOR SELECT USING (true);

-- groups 정책
DROP POLICY IF EXISTS "Everyone can view public groups" ON public.groups;
CREATE POLICY "Everyone can view public groups" ON public.groups FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);

-- notifications 정책
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- follows 정책
DROP POLICY IF EXISTS "Users can view all follows" ON public.follows;
CREATE POLICY "Users can view all follows" ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow others" ON public.follows;
CREATE POLICY "Users can unfollow others" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- group_memberships 정책
DROP POLICY IF EXISTS "Users can view group memberships" ON public.group_memberships;
CREATE POLICY "Users can view group memberships" ON public.group_memberships FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join groups" ON public.group_memberships;
CREATE POLICY "Users can join groups" ON public.group_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave groups" ON public.group_memberships;
CREATE POLICY "Users can leave groups" ON public.group_memberships FOR DELETE USING (auth.uid() = user_id);
```

### 3단계: 초기 데이터 삽입

**복사할 SQL (insert-initial-data.sql)**:

```sql
-- 초기 데이터 삽입 스크립트

-- 1. categories 초기 데이터 삽입
INSERT INTO public.categories (name, post_count, is_hot, icon, description) VALUES
('아기 수유 고민', 124, true, '🍼', '신생아 및 영아 수유 관련 고민과 노하우'),
('이유식 거부', 89, true, '🥄', '이유식을 거부하는 아기들을 위한 해결책'),
('밤수유 노하우', 78, false, '🌙', '밤수유를 편하게 하는 방법들'),
('변비 과열', 67, false, '💊', '아기 변비 해결법과 관련 정보'),
('놀이 활동', 56, false, '🧸', '월령별 놀이 활동과 발달 놀이'),
('둘째 조작', 45, false, '👶', '둘째 아이 키우기와 형제 관계'),
('육아휴직 복직', 34, false, '💼', '육아휴직 후 직장 복귀 관련'),
('모유수유 노하우', 23, false, '🤱', '모유수유 성공을 위한 팁')
ON CONFLICT (name) DO UPDATE SET
  post_count = EXCLUDED.post_count,
  is_hot = EXCLUDED.is_hot,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- 2. groups 초기 데이터 삽입
INSERT INTO public.groups (name, description, member_count, is_public, icon, color) VALUES
('신생아맘 모임', '0-6개월 신생아를 키우는 엄마들의 정보 공유 모임입니다. 수유, 잠자리, 발달 등 신생아 육아의 모든 것을 함께 나눠요.', 124, true, '👶', 'purple'),
('이유식 레시피', '이유식 레시피 공유와 노하우를 나누는 그룹입니다. 초기부터 완료기까지 다양한 레시피와 팁을 공유해요.', 89, true, '🍼', 'green'),
('워킹맘 라이프', '일과 육아를 병행하는 워킹맘들의 소통 공간입니다. 시간 관리, 육아 팁, 스트레스 관리법을 함께 나눠요.', 156, true, '💼', 'blue'),
('아빠 육아단', '육아에 적극적으로 참여하는 아빠들의 모임입니다. 아빠만의 육아 노하우와 경험담을 공유해요.', 67, true, '👨', 'orange')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  member_count = EXCLUDED.member_count,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- 3. 기존 profiles 업데이트 (포인트 시스템 추가)
UPDATE public.profiles SET
  points = CASE
    WHEN id = (SELECT id FROM public.profiles ORDER BY created_at LIMIT 1) THEN 1250
    ELSE 750 + (RANDOM() * 500)::INTEGER
  END,
  level = CASE
    WHEN id = (SELECT id FROM public.profiles ORDER BY created_at LIMIT 1) THEN 3
    ELSE 2
  END,
  ranking = CASE
    WHEN id = (SELECT id FROM public.profiles ORDER BY created_at LIMIT 1) THEN 42
    ELSE 50 + (RANDOM() * 100)::INTEGER
  END,
  next_badge_points = 250,
  followers_count = (RANDOM() * 50)::INTEGER,
  following_count = (RANDOM() * 30)::INTEGER
WHERE points IS NULL OR points = 0;
```

## 🔍 실행 순서

### 단계 1: 테이블 생성 (15분)
1. Supabase 대시보드 접속
2. SQL Editor 선택
3. 위의 첫 번째 SQL 전체 복사 후 실행
4. "Success" 메시지 확인

### 단계 2: 초기 데이터 삽입 (5분)
1. 새 SQL 쿼리 탭 열기
2. 위의 두 번째 SQL 전체 복사 후 실행
3. 데이터 삽입 성공 확인

### 단계 3: 실제 데이터 연동 확인 (10분)
- 배포된 사이트에서 사이드바 확인
- 실제 데이터가 표시되는지 테스트

## ✅ 완료 후 기대 효과

**변경 전 (MOCK)**:
- 고정된 포인트: 1,250 P
- 고정된 그룹 4개
- 고정된 카테고리 8개

**변경 후 (실제 데이터)**:
- 사용자별 개별 포인트 시스템
- 동적 그룹 관리 및 가입 기능
- 실시간 인기 카테고리 업데이트
- 실제 알림 시스템

🚀 **30분 후 100% 실제 데이터 연동 완료!**