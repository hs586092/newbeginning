-- =============================================
-- 기존 댓글 테이블 업그레이드 - 중첩댓글 및 기능 추가
-- =============================================

-- 1. comments 테이블에 누락된 컬럼 추가
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 2. 새로운 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS comments_parent_comment_id_idx ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS comments_post_id_created_at_idx ON comments(post_id, created_at DESC);

-- 3. 댓글 길이 제한 추가
ALTER TABLE comments 
ADD CONSTRAINT IF NOT EXISTS comments_content_length 
CHECK (length(content) >= 1 AND length(content) <= 1000);

-- 4. 댓글 통계 뷰 생성
DROP VIEW IF EXISTS comment_stats;
CREATE VIEW comment_stats AS
SELECT 
    c.id,
    c.post_id,
    c.user_id,
    c.author_name,
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

-- 5. RLS 정책 활성화 및 설정
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- 댓글 정책 생성
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create comments" ON comments 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own comments" ON comments 
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. 좋아요 정책 설정
DROP POLICY IF EXISTS "Anyone can view comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Authenticated users can like comments" ON comment_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON comment_likes;

CREATE POLICY "Anyone can view comment likes" ON comment_likes FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can like comments" ON comment_likes 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can unlike their own likes" ON comment_likes 
    FOR DELETE USING (auth.uid() = user_id);

-- 7. 실시간 알림 함수
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

-- 8. 트리거 생성
DROP TRIGGER IF EXISTS comment_changes_trigger ON comments;
CREATE TRIGGER comment_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_comment_changes();

-- 9. updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 성공 메시지
SELECT '✅ 댓글 시스템 테이블 업그레이드 완료! 2레벨 중첩댓글 및 실시간 기능 추가됨' as result;