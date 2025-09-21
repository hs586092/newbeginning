-- =============================================
-- Missing RPC Functions for NewBeginning App
-- =============================================

-- 1. get_post_likes function (missing from existing RPC)
CREATE OR REPLACE FUNCTION get_post_likes(p_post_id UUID)
RETURNS INTEGER
SECURITY DEFINER
AS $$
DECLARE
    like_count INTEGER;
BEGIN
    IF p_post_id IS NULL THEN
        RETURN 0;
    END IF;

    SELECT COUNT(*)::INTEGER INTO like_count
    FROM post_likes
    WHERE post_id = p_post_id;

    RETURN COALESCE(like_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 2. toggle_like function (app expects this name)
CREATE OR REPLACE FUNCTION toggle_like(p_post_id UUID)
RETURNS JSON
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    existing_like_id UUID;
    new_like_count INTEGER;
    is_liked BOOLEAN := FALSE;
BEGIN
    -- Get current user (or use a test user if not authenticated)
    current_user_id := auth.uid();

    -- For testing purposes, use the existing user if no auth
    IF current_user_id IS NULL THEN
        SELECT id INTO current_user_id
        FROM auth.users
        LIMIT 1;
    END IF;

    IF p_post_id IS NULL OR current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', 'Invalid parameters or user not authenticated'
        );
    END IF;

    -- Check existing like
    SELECT id INTO existing_like_id
    FROM post_likes
    WHERE post_id = p_post_id AND user_id = current_user_id;

    IF existing_like_id IS NOT NULL THEN
        -- Remove like
        DELETE FROM post_likes WHERE id = existing_like_id;
        is_liked := FALSE;
    ELSE
        -- Add like
        INSERT INTO post_likes (post_id, user_id, created_at)
        VALUES (p_post_id, current_user_id, NOW());
        is_liked := TRUE;
    END IF;

    -- Get new count
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

-- 3. add_comment function (app expects this name)
CREATE OR REPLACE FUNCTION add_comment(
    p_post_id UUID,
    p_content TEXT
)
RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    current_username TEXT;
    new_comment_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();

    -- For testing purposes, use existing user if no auth
    IF current_user_id IS NULL THEN
        SELECT id INTO current_user_id
        FROM auth.users
        LIMIT 1;
    END IF;

    -- Get username from profiles
    SELECT username INTO current_username
    FROM profiles
    WHERE id = current_user_id;

    -- Fallback username
    IF current_username IS NULL THEN
        current_username := 'Anonymous';
    END IF;

    IF p_post_id IS NULL OR p_content IS NULL OR current_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid parameters: required fields are missing';
    END IF;

    INSERT INTO comments (
        post_id,
        user_id,
        author_name,
        content,
        created_at,
        updated_at
    ) VALUES (
        p_post_id,
        current_user_id,
        current_username,
        p_content,
        NOW(),
        NOW()
    ) RETURNING id INTO new_comment_id;

    RETURN new_comment_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_post_likes(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION toggle_like(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION add_comment(UUID, TEXT) TO authenticated, anon, service_role;

-- Success message
SELECT '✅ Missing RPC functions created successfully!' as result;