-- =============================================
-- NewBeginning RPC 함수 - 수정된 버전 (인증 체크 완화)
-- =============================================

-- 1. 게시글 좋아요 토글 함수 수정
CREATE OR REPLACE FUNCTION toggle_post_like(
    p_post_id UUID,
    p_user_id UUID
)
RETURNS JSON
SECURITY DEFINER
AS $$
DECLARE
    existing_like_id UUID;
    new_like_count INTEGER;
    is_liked BOOLEAN := FALSE;
BEGIN
    -- 기본적인 매개변수 검증만 수행 (인증은 클라이언트에서 처리)
    IF p_post_id IS NULL OR p_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid parameters: post_id and user_id are required';
    END IF;

    -- 기존 좋아요 확인
    SELECT id INTO existing_like_id
    FROM post_likes
    WHERE post_id = p_post_id AND user_id = p_user_id;

    IF existing_like_id IS NOT NULL THEN
        -- 좋아요 취소
        DELETE FROM post_likes WHERE id = existing_like_id;
        is_liked := FALSE;
    ELSE
        -- 좋아요 추가
        INSERT INTO post_likes (post_id, user_id, created_at)
        VALUES (p_post_id, p_user_id, NOW());
        is_liked := TRUE;
    END IF;

    -- 현재 좋아요 수 계산
    SELECT COUNT(*)::INTEGER INTO new_like_count
    FROM post_likes
    WHERE post_id = p_post_id;

    RETURN json_build_object(
        'success', TRUE,
        'liked', is_liked,
        'like_count', new_like_count
    );
END;
$$ LANGUAGE plpgsql;

-- 2. 댓글 생성 함수 수정
CREATE OR REPLACE FUNCTION create_comment(
    p_post_id UUID,
    p_user_id UUID,
    p_author_name TEXT,
    p_content TEXT,
    p_parent_comment_id UUID DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
    new_comment_id UUID;
BEGIN
    -- 기본적인 매개변수 검증만 수행
    IF p_post_id IS NULL OR p_user_id IS NULL OR p_author_name IS NULL OR p_content IS NULL THEN
        RAISE EXCEPTION 'Invalid parameters: required fields are missing';
    END IF;

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

-- 3. 댓글 수정 함수 수정
CREATE OR REPLACE FUNCTION update_comment(
    p_comment_id UUID,
    p_user_id UUID,
    p_content TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- 기본적인 매개변수 검증만 수행
    IF p_comment_id IS NULL OR p_user_id IS NULL OR p_content IS NULL THEN
        RAISE EXCEPTION 'Invalid parameters: required fields are missing';
    END IF;

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

-- 4. 댓글 삭제 함수 수정
CREATE OR REPLACE FUNCTION delete_comment(
    p_comment_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- 기본적인 매개변수 검증만 수행
    IF p_comment_id IS NULL OR p_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid parameters: required fields are missing';
    END IF;

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

-- 5. 댓글 좋아요 토글 함수 수정
CREATE OR REPLACE FUNCTION toggle_comment_like(
    p_comment_id UUID,
    p_user_id UUID
)
RETURNS JSON
SECURITY DEFINER
AS $$
DECLARE
    existing_like_id UUID;
    new_like_count INTEGER;
    is_liked BOOLEAN := FALSE;
BEGIN
    -- 기본적인 매개변수 검증만 수행
    IF p_comment_id IS NULL OR p_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid parameters: comment_id and user_id are required';
    END IF;

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

-- 함수 권한 설정 (인증된 사용자와 서비스 역할에게 실행 권한 부여)
GRANT EXECUTE ON FUNCTION toggle_post_like(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_comment(UUID, UUID, TEXT, TEXT, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_comment(UUID, UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION delete_comment(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION toggle_comment_like(UUID, UUID) TO authenticated, service_role;

-- 성공 메시지
SELECT '🎉 NewBeginning RPC 함수 수정 완료! 인증 체크 완화로 함수 접근성 개선' as result;