-- =============================================
-- 댓글 시스템 RPC 함수 구현
-- =============================================

-- 1. 게시글의 댓글 목록 조회 (중첩댓글 지원)
CREATE OR REPLACE FUNCTION get_post_comments(p_post_id UUID)
RETURNS TABLE (
    id UUID,
    post_id UUID,
    user_id UUID,
    author_name TEXT,
    content TEXT,
    parent_comment_id UUID,
    is_deleted BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    profile_username TEXT,
    profile_avatar_url TEXT,
    reply_count BIGINT,
    like_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.post_id,
        c.user_id,
        c.author_name,
        c.content,
        c.parent_comment_id,
        c.is_deleted,
        c.created_at,
        c.updated_at,
        p.username as profile_username,
        p.avatar_url as profile_avatar_url,
        -- 답글 수 계산
        (SELECT COUNT(*)::BIGINT FROM comments cc WHERE cc.parent_comment_id = c.id AND cc.is_deleted = FALSE) as reply_count,
        -- 좋아요 수 계산
        (SELECT COUNT(*)::BIGINT FROM comment_likes cl WHERE cl.comment_id = c.id) as like_count
    FROM comments c
    LEFT JOIN profiles p ON c.user_id = p.id
    WHERE c.post_id = p_post_id 
    AND c.is_deleted = FALSE
    ORDER BY 
        CASE WHEN c.parent_comment_id IS NULL THEN c.created_at ELSE NULL END ASC NULLS LAST,
        CASE WHEN c.parent_comment_id IS NOT NULL THEN c.created_at ELSE NULL END ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- 2. 댓글 생성
CREATE OR REPLACE FUNCTION create_comment(
    p_post_id UUID,
    p_user_id UUID,
    p_author_name TEXT,
    p_content TEXT,
    p_parent_comment_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_comment_id UUID;
BEGIN
    INSERT INTO comments (
        post_id,
        user_id,
        author_name,
        content,
        parent_comment_id,
        created_at,
        updated_at
    ) VALUES (
        p_post_id,
        p_user_id,
        p_author_name,
        p_content,
        p_parent_comment_id,
        NOW(),
        NOW()
    ) RETURNING id INTO new_comment_id;
    
    RETURN new_comment_id;
END;
$$ LANGUAGE plpgsql;

-- 3. 댓글 수정
CREATE OR REPLACE FUNCTION update_comment(
    p_comment_id UUID,
    p_user_id UUID,
    p_content TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE comments 
    SET 
        content = p_content,
        updated_at = NOW()
    WHERE id = p_comment_id 
    AND user_id = p_user_id
    AND is_deleted = FALSE;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- 4. 댓글 삭제 (소프트 삭제)
CREATE OR REPLACE FUNCTION delete_comment(
    p_comment_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE comments 
    SET 
        is_deleted = TRUE,
        updated_at = NOW()
    WHERE id = p_comment_id 
    AND user_id = p_user_id
    AND is_deleted = FALSE;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- 5. 댓글 좋아요 토글
CREATE OR REPLACE FUNCTION toggle_comment_like(
    p_comment_id UUID,
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
    FROM comment_likes 
    WHERE comment_id = p_comment_id AND user_id = p_user_id;
    
    IF existing_like_id IS NOT NULL THEN
        -- 좋아요 취소
        DELETE FROM comment_likes WHERE id = existing_like_id;
        is_liked := FALSE;
    ELSE
        -- 좋아요 추가
        INSERT INTO comment_likes (comment_id, user_id, created_at) 
        VALUES (p_comment_id, p_user_id, NOW());
        is_liked := TRUE;
    END IF;
    
    -- 현재 좋아요 수 계산
    SELECT COUNT(*)::INTEGER INTO new_like_count 
    FROM comment_likes 
    WHERE comment_id = p_comment_id;
    
    RETURN json_build_object(
        'success', TRUE,
        'liked', is_liked,
        'like_count', new_like_count
    );
END;
$$ LANGUAGE plpgsql;

-- 6. 게시글별 댓글 수 조회
CREATE OR REPLACE FUNCTION get_post_comment_count(p_post_id UUID)
RETURNS INTEGER AS $$
DECLARE
    comment_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO comment_count
    FROM comments 
    WHERE post_id = p_post_id 
    AND is_deleted = FALSE;
    
    RETURN comment_count;
END;
$$ LANGUAGE plpgsql;

-- 7. 사용자별 댓글 목록 조회
CREATE OR REPLACE FUNCTION get_user_comments(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    post_id UUID,
    content TEXT,
    created_at TIMESTAMPTZ,
    post_title TEXT,
    reply_count BIGINT,
    like_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.post_id,
        c.content,
        c.created_at,
        p.title as post_title,
        (SELECT COUNT(*)::BIGINT FROM comments cc WHERE cc.parent_comment_id = c.id AND cc.is_deleted = FALSE) as reply_count,
        (SELECT COUNT(*)::BIGINT FROM comment_likes cl WHERE cl.comment_id = c.id) as like_count
    FROM comments c
    LEFT JOIN posts p ON c.post_id = p.id
    WHERE c.user_id = p_user_id 
    AND c.is_deleted = FALSE
    ORDER BY c.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 8. 실시간 알림을 위한 함수 (PostgreSQL LISTEN/NOTIFY)
CREATE OR REPLACE FUNCTION notify_comment_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM pg_notify('comment_changes', json_build_object(
            'type', 'INSERT',
            'post_id', NEW.post_id,
            'comment_id', NEW.id,
            'user_id', NEW.user_id
        )::text);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM pg_notify('comment_changes', json_build_object(
            'type', 'UPDATE', 
            'post_id', NEW.post_id,
            'comment_id', NEW.id,
            'user_id', NEW.user_id
        )::text);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM pg_notify('comment_changes', json_build_object(
            'type', 'DELETE',
            'post_id', OLD.post_id,
            'comment_id', OLD.id,
            'user_id', OLD.user_id
        )::text);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS comment_change_notify ON comments;
CREATE TRIGGER comment_change_notify
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_comment_change();

-- 함수 권한 설정 (인증된 사용자와 서비스 역할에게 실행 권한 부여)
GRANT EXECUTE ON FUNCTION get_post_comments(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_comment(UUID, UUID, TEXT, TEXT, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_comment(UUID, UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION delete_comment(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION toggle_comment_like(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_post_comment_count(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_comments(UUID, INTEGER, INTEGER) TO authenticated, service_role;

-- 성공 메시지
SELECT '🎉 댓글 시스템 RPC 함수 구현 완료! 8개 함수 + 실시간 알림 시스템 생성됨' as result;