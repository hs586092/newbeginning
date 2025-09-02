-- 첫돌까지 소셜 피드 데이터베이스 스키마
-- Supabase에서 실행할 SQL

-- 1. 카테고리 테이블 생성
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  description TEXT,
  order_index INTEGER
);

-- 2. 카테고리 데이터 삽입
INSERT INTO categories (id, name, icon, color, description, order_index) VALUES
('all', '전체', '🏠', 'gray', '모든 카테고리의 게시글', 0),
('pregnancy', '임신', '🤰', 'purple', '임신 관련 경험과 정보', 1),
('newborn', '신생아', '👶', 'pink', '0-3개월 신생아 돌봄', 2),
('infant', '영아', '🍼', 'blue', '4-12개월 영아 돌봄', 3),
('babyfood', '이유식', '🥄', 'green', '이유식 레시피와 노하우', 4),
('sleep', '수면', '😴', 'indigo', '수면 패턴과 수면 교육', 5),
('health', '건강', '🏥', 'red', '아기 건강과 병원 정보', 6),
('daily', '일상', '💬', 'yellow', '육아 일상과 소소한 이야기', 7),
('emergency', '응급', '🚨', 'red', '응급상황 대처와 안전', 8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

-- 3. posts 테이블에 소셜 피드 기능 추가
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS category_id TEXT REFERENCES categories(id) DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS baby_month INTEGER CHECK (baby_month >= 0 AND baby_month <= 24),
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS poll JSONB,
ADD COLUMN IF NOT EXISTS hugs INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_question BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS mood TEXT;

-- 4. 포근(좋아요/하트) 테이블 생성
CREATE TABLE IF NOT EXISTS post_hugs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 5. profiles 테이블에 추가 정보
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS baby_birth_date DATE,
ADD COLUMN IF NOT EXISTS baby_name TEXT,
ADD COLUMN IF NOT EXISTS is_pregnant BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS pregnancy_week INTEGER,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 6. 댓글에 아기 개월수 정보 추가
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS baby_month INTEGER CHECK (baby_month >= 0 AND baby_month <= 24);

-- 7. 북마크/저장 기능
CREATE TABLE IF NOT EXISTS post_bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 8. 팔로우 시스템 (선택사항)
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 9. 알림 시스템
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'hug', 'comment', 'follow', 'mention'
  title TEXT NOT NULL,
  message TEXT,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. RLS (Row Level Security) 정책 설정
-- categories 테이블 - 모든 사용자 읽기 가능
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT 
USING (true);

-- post_hugs 테이블 - 자신의 좋아요만 수정 가능, 모든 사용자 읽기 가능
ALTER TABLE post_hugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hugs are viewable by everyone" 
ON post_hugs FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own hugs" 
ON post_hugs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hugs" 
ON post_hugs FOR DELETE 
USING (auth.uid() = user_id);

-- post_bookmarks 테이블 - 자신의 북마크만 관리 가능
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" 
ON post_bookmarks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" 
ON post_bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
ON post_bookmarks FOR DELETE 
USING (auth.uid() = user_id);

-- notifications 테이블 - 자신의 알림만 접근 가능
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- 11. 트리거 함수들

-- 포근 수 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_post_hugs_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET hugs = hugs + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET hugs = hugs - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_hugs_count_trigger
  AFTER INSERT OR DELETE ON post_hugs
  FOR EACH ROW EXECUTE FUNCTION update_post_hugs_count();

-- 12. 뷰 생성 - 소셜 피드용 포스트 데이터
CREATE OR REPLACE VIEW social_feed_posts AS
SELECT 
  p.*,
  prof.username,
  prof.avatar_url,
  prof.baby_birth_date,
  prof.baby_name,
  prof.is_pregnant,
  prof.pregnancy_week,
  c.name as category_name,
  c.icon as category_icon,
  c.color as category_color,
  -- 현재 사용자의 좋아요 여부 (로그인 상태에서)
  CASE WHEN h.user_id IS NOT NULL THEN true ELSE false END as is_hugged_by_me,
  -- 현재 사용자의 북마크 여부 (로그인 상태에서)  
  CASE WHEN b.user_id IS NOT NULL THEN true ELSE false END as is_bookmarked_by_me
FROM posts p
LEFT JOIN profiles prof ON p.user_id = prof.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN post_hugs h ON p.id = h.post_id AND h.user_id = auth.uid()
LEFT JOIN post_bookmarks b ON p.id = b.post_id AND b.user_id = auth.uid()
WHERE p.id IS NOT NULL
ORDER BY p.created_at DESC;

-- 인덱스 생성으로 성능 최적화
CREATE INDEX IF NOT EXISTS idx_posts_category_created_at ON posts(category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_baby_month ON posts(baby_month);
CREATE INDEX IF NOT EXISTS idx_posts_hugs ON posts(hugs DESC);
CREATE INDEX IF NOT EXISTS idx_post_hugs_post_id ON post_hugs(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hugs_user_id ON post_hugs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);