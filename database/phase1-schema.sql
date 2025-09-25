-- Phase 1: 핵심 사이드바 데이터 스키마
-- MOCK 데이터 제거를 위한 필수 테이블 생성

-- 1. profiles 테이블 확장 (포인트 시스템)
DO $$
BEGIN
    -- profiles 테이블이 존재하는지 확인
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- 포인트 시스템 컬럼 추가
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'points') THEN
            ALTER TABLE profiles ADD COLUMN points INTEGER DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'level') THEN
            ALTER TABLE profiles ADD COLUMN level INTEGER DEFAULT 1;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ranking') THEN
            ALTER TABLE profiles ADD COLUMN ranking INTEGER;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'next_badge_points') THEN
            ALTER TABLE profiles ADD COLUMN next_badge_points INTEGER DEFAULT 250;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'followers_count') THEN
            ALTER TABLE profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'following_count') THEN
            ALTER TABLE profiles ADD COLUMN following_count INTEGER DEFAULT 0;
        END IF;

        -- 타임스탬프 컬럼
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
            ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
            ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        END IF;
    ELSE
        -- profiles 테이블이 없으면 생성
        CREATE TABLE profiles (
            id UUID REFERENCES auth.users(id) PRIMARY KEY,
            username VARCHAR(50) UNIQUE,
            email VARCHAR(255),
            points INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            ranking INTEGER,
            next_badge_points INTEGER DEFAULT 250,
            followers_count INTEGER DEFAULT 0,
            following_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
    END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_ranking ON profiles(ranking ASC);

-- 2. categories 테이블 생성
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  post_count INTEGER DEFAULT 0,
  is_hot BOOLEAN DEFAULT false,
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_categories_hot ON categories(is_hot DESC, post_count DESC);
CREATE INDEX IF NOT EXISTS idx_categories_post_count ON categories(post_count DESC);

-- 3. groups 테이블 생성
CREATE TABLE IF NOT EXISTS groups (
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_groups_member_count ON groups(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_groups_public ON groups(is_public, member_count DESC);

-- 4. group_memberships 테이블 생성
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- member, admin, owner
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(group_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);

-- 5. notifications 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- message, follow, like, comment, group_join
  title VARCHAR(200),
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  related_id UUID, -- 관련 게시글, 메시지, 그룹 등의 ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at DESC);

-- 6. follows 테이블 생성
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- 초기 데이터 삽입

-- 카테고리 초기 데이터
INSERT INTO categories (name, post_count, is_hot, icon, description) VALUES
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

-- 그룹 초기 데이터
INSERT INTO groups (name, description, member_count, is_public, icon, color) VALUES
('신생아맘 모임', '0-6개월 신생아를 키우는 엄마들의 정보 공유 모임입니다. 수유, 잠자리, 발달 등 신생아 육아의 모든 것을 함께 나눠요.', 124, true, '👶', 'purple'),
('이유식 레시피', '이유식 레시피 공유와 노하우를 나누는 그룹입니다. 초기부터 완료기까지 다양한 레시피와 팁을 공유해요.', 89, true, '🍼', 'green'),
('워킹맘 라이프', '일과 육아를 병행하는 워킹맘들의 소통 공간입니다. 시간 관리, 육아 팁, 스트레스 관리법을 함께 나눠요.', 156, true, '💼', 'blue'),
('아빠 육아단', '육아에 적극적으로 참여하는 아빠들의 모임입니다. 아빠만의 육아 노하우와 경험담을 공유해요.', 67, true, '👨', 'orange')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  member_count = EXCLUDED.member_count,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- RLS (Row Level Security) 정책 설정

-- profiles 테이블 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- categories 테이블 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view categories" ON categories
  FOR SELECT USING (true);

-- groups 테이블 RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view public groups" ON groups
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group owners can update groups" ON groups
  FOR UPDATE USING (auth.uid() = created_by);

-- group_memberships 테이블 RLS
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group memberships" ON group_memberships
  FOR SELECT USING (true);

CREATE POLICY "Users can join groups" ON group_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON group_memberships
  FOR DELETE USING (auth.uid() = user_id);

-- notifications 테이블 RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- follows 테이블 RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- 트리거 함수 생성 (업데이트 시간 자동 갱신)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 추가
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 그룹 멤버 수 업데이트 트리거
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE groups
        SET member_count = member_count + 1
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE groups
        SET member_count = GREATEST(member_count - 1, 0)
        WHERE id = OLD.group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS group_membership_count_trigger ON group_memberships;
CREATE TRIGGER group_membership_count_trigger
    AFTER INSERT OR DELETE ON group_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_group_member_count();

-- 팔로우 수 업데이트 트리거
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 팔로워 수 증가
        UPDATE profiles
        SET followers_count = followers_count + 1
        WHERE id = NEW.following_id;

        -- 팔로잉 수 증가
        UPDATE profiles
        SET following_count = following_count + 1
        WHERE id = NEW.follower_id;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 팔로워 수 감소
        UPDATE profiles
        SET followers_count = GREATEST(followers_count - 1, 0)
        WHERE id = OLD.following_id;

        -- 팔로잉 수 감소
        UPDATE profiles
        SET following_count = GREATEST(following_count - 1, 0)
        WHERE id = OLD.follower_id;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS follow_count_trigger ON follows;
CREATE TRIGGER follow_count_trigger
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follow_counts();