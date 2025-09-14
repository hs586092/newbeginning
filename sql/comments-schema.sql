-- =============================================
-- 댓글 시스템 데이터베이스 스키마
-- 2레벨 중첩댓글 지원 + 실시간 기능
-- =============================================

-- Comments 테이블 생성
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 성능 최적화를 위한 인덱스
    CONSTRAINT comments_content_length CHECK (length(content) >= 1 AND length(content) <= 1000)
);

-- 인덱스 생성 (쿼리 성능 최적화)
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);
CREATE INDEX IF NOT EXISTS comments_parent_comment_id_idx ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);

-- 댓글 좋아요 테이블
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 중복 좋아요 방지
    UNIQUE(comment_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS comment_likes_comment_id_idx ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS comment_likes_user_id_idx ON comment_likes(user_id);

-- 댓글 통계를 위한 뷰 (성능 최적화)
CREATE OR REPLACE VIEW comment_stats AS
SELECT 
    c.id,
    c.post_id,
    c.user_id,
    c.parent_comment_id,
    c.content,
    c.is_deleted,
    c.created_at,
    c.updated_at,
    COALESCE(cl.like_count, 0) as like_count,
    COALESCE(cr.reply_count, 0) as reply_count
FROM comments c
LEFT JOIN (
    SELECT comment_id, COUNT(*) as like_count
    FROM comment_likes
    GROUP BY comment_id
) cl ON c.id = cl.comment_id
LEFT JOIN (
    SELECT parent_comment_id, COUNT(*) as reply_count
    FROM comments
    WHERE parent_comment_id IS NOT NULL AND is_deleted = FALSE
    GROUP BY parent_comment_id
) cr ON c.id = cr.parent_comment_id
WHERE c.is_deleted = FALSE;

-- RLS (Row Level Security) 정책 설정
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- 댓글 읽기: 모든 사용자 가능
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (TRUE);

-- 댓글 작성: 인증된 사용자만
CREATE POLICY "Authenticated users can create comments" ON comments 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 댓글 수정: 작성자만
CREATE POLICY "Users can update own comments" ON comments 
    FOR UPDATE USING (auth.uid() = user_id);

-- 댓글 삭제: 작성자만 (soft delete)
CREATE POLICY "Users can delete own comments" ON comments 
    FOR UPDATE USING (auth.uid() = user_id);

-- 댓글 좋아요 정책
CREATE POLICY "Anyone can view comment likes" ON comment_likes FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can like comments" ON comment_likes 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can unlike their own likes" ON comment_likes 
    FOR DELETE USING (auth.uid() = user_id);

-- 실시간 구독을 위한 함수
CREATE OR REPLACE FUNCTION notify_comment_changes()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM pg_notify('comment_changes', 
            json_build_object(
                'operation', TG_OP,
                'record', row_to_json(NEW),
                'post_id', NEW.post_id
            )::text
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM pg_notify('comment_changes',
            json_build_object(
                'operation', TG_OP,
                'record', row_to_json(NEW),
                'old_record', row_to_json(OLD),
                'post_id', NEW.post_id
            )::text
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM pg_notify('comment_changes',
            json_build_object(
                'operation', TG_OP,
                'record', row_to_json(OLD),
                'post_id', OLD.post_id
            )::text
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS comment_changes_trigger ON comments;
CREATE TRIGGER comment_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_comment_changes();

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 성공 메시지
SELECT '✅ 댓글 시스템 데이터베이스 스키마 생성 완료!' as result;