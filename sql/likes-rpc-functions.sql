-- =============================================
-- 좋아요 시스템 RPC 함수 구현
-- =============================================

-- 1. 게시글의 좋아요 목록 조회 (프로필 정보 포함)
CREATE OR REPLACE FUNCTION get_post_likes(p_post_id UUID)
RETURNS TABLE (
    id UUID,
    post_id UUID,
    user_id UUID,
    created_at TIMESTAMPTZ,
    profile_username TEXT,
    profile_avatar_url TEXT,
    post_title TEXT,
    post_category TEXT,
    like_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.post_id,
        l.user_id,
        l.created_at,
        COALESCE(p.username, 'Anonymous')::TEXT as profile_username,
        p.avatar_url::TEXT as profile_avatar_url,
        po.title::TEXT as post_title,
        po.category::TEXT as post_category,
        -- 현재 게시글의 총 좋아요 수
        (SELECT COUNT(*)::BIGINT FROM likes ll WHERE ll.post_id = p_post_id) as like_count
    FROM likes l
    LEFT JOIN profiles p ON l.user_id = p.id
    LEFT JOIN posts po ON l.post_id = po.id
    WHERE l.post_id = p_post_id
    ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. 좋아요 토글 (생성/삭제)
CREATE OR REPLACE FUNCTION toggle_post_like(
    p_post_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    existing_like_id UUID;
    new_like_count INTEGER;
    is_liked BOOLEAN := FALSE;
BEGIN
    -- 기존 좋아요 확인
    SELECT id INTO existing_like_id 
    FROM likes 
    WHERE post_id = p_post_id AND user_id = p_user_id;
    
    IF existing_like_id IS NOT NULL THEN
        -- 좋아요 취소
        DELETE FROM likes WHERE id = existing_like_id;
        is_liked := FALSE;
    ELSE
        -- 좋아요 추가
        INSERT INTO likes (post_id, user_id, created_at) 
        VALUES (p_post_id, p_user_id, NOW());
        is_liked := TRUE;
    END IF;
    
    -- 현재 좋아요 수 계산
    SELECT COUNT(*)::INTEGER INTO new_like_count 
    FROM likes 
    WHERE post_id = p_post_id;
    
    RETURN json_build_object(
        'success', TRUE,
        'liked', is_liked,
        'like_count', new_like_count
    );
END;
$$ LANGUAGE plpgsql;

-- 3. 특정 사용자가 좋아요한 게시글 목록 조회
CREATE OR REPLACE FUNCTION get_user_likes(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    post_id UUID,
    created_at TIMESTAMPTZ,
    post_title TEXT,
    post_content TEXT,
    post_category TEXT,
    post_author_name TEXT,
    post_created_at TIMESTAMPTZ,
    like_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.post_id,
        l.created_at,
        p.title::TEXT as post_title,
        p.content::TEXT as post_content,
        p.category::TEXT as post_category,
        p.author_name::TEXT as post_author_name,
        p.created_at as post_created_at,
        -- 해당 게시글의 총 좋아요 수
        (SELECT COUNT(*)::BIGINT FROM likes ll WHERE ll.post_id = l.post_id) as like_count
    FROM likes l
    LEFT JOIN posts p ON l.post_id = p.id
    WHERE l.user_id = p_user_id
    ORDER BY l.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 4. 게시글별 좋아요 수 조회
CREATE OR REPLACE FUNCTION get_post_like_count(p_post_id UUID)
RETURNS INTEGER AS $$
DECLARE
    like_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO like_count
    FROM likes 
    WHERE post_id = p_post_id;
    
    RETURN like_count;
END;
$$ LANGUAGE plpgsql;

-- 5. 사용자의 좋아요 여부 확인
CREATE OR REPLACE FUNCTION check_user_liked_post(
    p_post_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    existing_like_id UUID;
    total_likes INTEGER;
BEGIN
    -- 사용자의 좋아요 여부 확인
    SELECT id INTO existing_like_id 
    FROM likes 
    WHERE post_id = p_post_id AND user_id = p_user_id;
    
    -- 전체 좋아요 수 조회
    SELECT COUNT(*)::INTEGER INTO total_likes 
    FROM likes 
    WHERE post_id = p_post_id;
    
    RETURN json_build_object(
        'is_liked', (existing_like_id IS NOT NULL),
        'like_count', total_likes,
        'like_id', existing_like_id
    );
END;
$$ LANGUAGE plpgsql;

-- 6. 실시간 알림을 위한 함수 (PostgreSQL LISTEN/NOTIFY)
CREATE OR REPLACE FUNCTION notify_like_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM pg_notify('like_changes', json_build_object(
            'type', 'INSERT',
            'post_id', NEW.post_id,
            'user_id', NEW.user_id,
            'like_id', NEW.id,
            'timestamp', extract(epoch from NOW())
        )::text);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM pg_notify('like_changes', json_build_object(
            'type', 'DELETE',
            'post_id', OLD.post_id,
            'user_id', OLD.user_id,
            'like_id', OLD.id,
            'timestamp', extract(epoch from NOW())
        )::text);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (기존 트리거가 있다면 삭제 후 생성)
DROP TRIGGER IF EXISTS like_change_notify ON likes;
CREATE TRIGGER like_change_notify
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION notify_like_change();

-- 함수 권한 설정 (인증된 사용자와 서비스 역할에게 실행 권한 부여)
GRANT EXECUTE ON FUNCTION get_post_likes(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION toggle_post_like(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_likes(UUID, INTEGER, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_post_like_count(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION check_user_liked_post(UUID, UUID) TO authenticated, service_role;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC);

-- 성공 메시지
SELECT '🎉 좋아요 시스템 RPC 함수 구현 완료! 5개 함수 + 실시간 알림 시스템 생성됨' as result;