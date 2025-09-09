-- Comment Likes 기능을 위한 데이터베이스 스키마

-- 1. comment_likes 테이블 생성
CREATE TABLE comment_likes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- 한 사용자가 같은 댓글에 중복 좋아요 방지
    UNIQUE(comment_id, user_id)
);

-- 2. RLS (Row Level Security) 활성화
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 생성
-- 모든 사용자가 댓글 좋아요 수 조회 가능
CREATE POLICY "Anyone can view comment likes" ON comment_likes
    FOR SELECT USING (true);

-- 로그인한 사용자만 좋아요 생성/삭제 가능 (본인 것만)
CREATE POLICY "Users can create their own comment likes" ON comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes" ON comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 4. 성능 최적화 인덱스
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX idx_comment_likes_created_at ON comment_likes(created_at DESC);

-- 5. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_comment_likes_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_comment_likes_updated_at
    BEFORE UPDATE ON comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_likes_updated_at_column();

-- 6. 생성 결과 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'comment_likes'
ORDER BY ordinal_position;