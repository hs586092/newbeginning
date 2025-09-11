-- =============================================
-- RPC 함수 타입 불일치 문제 해결
-- =============================================

-- 수정된 get_post_comments 함수 - 타입 캐스팅 추가
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
        c.author_name::TEXT,  -- 명시적 TEXT 캐스팅
        c.content::TEXT,      -- 명시적 TEXT 캐스팅
        c.parent_comment_id,
        c.is_deleted,
        c.created_at,
        c.updated_at,
        COALESCE(p.username, '')::TEXT as profile_username,    -- NULL 처리와 명시적 캐스팅
        COALESCE(p.avatar_url, '')::TEXT as profile_avatar_url, -- NULL 처리와 명시적 캐스팅
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

-- 권한 재설정
GRANT EXECUTE ON FUNCTION get_post_comments(UUID) TO authenticated, service_role;

-- 성공 메시지
SELECT '🔧 RPC 함수 타입 불일치 문제 해결 완료' as result;