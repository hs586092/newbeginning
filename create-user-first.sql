-- =============================================
-- 사용자 먼저 생성 후 게시글 추가
-- auth.users 테이블 사용
-- =============================================

BEGIN;

-- 방법: auth.users에 직접 사용자 생성 (위험할 수 있음)
-- 또는 현재 로그인한 사용자 확인

DO $$
DECLARE
    sample_user_id uuid := '550e8400-e29b-41d4-a716-446655440000';
    current_auth_user_id uuid;
BEGIN
    -- 현재 로그인한 사용자 확인
    SELECT auth.uid() INTO current_auth_user_id;
    
    -- 로그인한 사용자가 있으면 그 사용자 사용
    IF current_auth_user_id IS NOT NULL THEN
        sample_user_id := current_auth_user_id;
    ELSE
        -- 로그인한 사용자가 없으면 샘플 사용자를 auth.users에 추가 시도
        -- 주의: 이 방법은 RLS와 충돌할 수 있음
        RAISE NOTICE '현재 로그인한 사용자가 없습니다. 먼저 웹사이트에서 회원가입을 해주세요.';
        RETURN;
    END IF;

    -- 게시글 생성
    INSERT INTO posts (id, user_id, author_name, title, content, category, is_question, baby_month, view_count, created_at) VALUES

    ('550e8400-e29b-41d4-a716-446655440001', sample_user_id, '민주맘', '신생아 목욕 꿀팁', 
     '첫째 때는 정말 무서웠는데, 이제 둘째하면서 깨달은 신생아 목욕 꿀팁들이 있어요.', 
     'newborn', false, 1, 124, NOW() - INTERVAL '2 days'),

    ('550e8400-e29b-41d4-a716-446655440002', sample_user_id, '현우아빠', '이유식 거부 해결법', 
     '12개월 첫째가 이유식을 정말 안 먹어서 고생했는데, 지금은 잘 먹어요!', 
     'toddler', false, 12, 89, NOW() - INTERVAL '1 day'),

    ('550e8400-e29b-41d4-a716-446655440003', sample_user_id, '재현파파', '밤중 수유 방법', 
     '4개월 아기 아빠입니다. 밤중 수유할 때 정말 힘들잖아요.', 
     'newborn', false, 4, 67, NOW() - INTERVAL '3 hours'),

    ('550e8400-e29b-41d4-a716-446655440004', sample_user_id, '한할머니', '육아 지혜', 
     '50년 넘게 아이들을 지켜본 할머니로서 말씀드려요.', 
     'expert', false, null, 203, NOW() - INTERVAL '1 week'),

    ('550e8400-e29b-41d4-a716-446655440005', sample_user_id, '영파파', '18개월 아이 놀이', 
     '비오는 날 집에서 18개월 아들과 뭘 할지 고민하다가 찾은 놀이들이에요!', 
     'toddler', false, 18, 78, NOW() - INTERVAL '2 days');

    RAISE NOTICE '✅ 5개 게시글이 사용자 ID %와 함께 생성되었습니다!', sample_user_id;

END $$;

COMMIT;

SELECT '✅ 샘플 데이터 생성 시도 완료!' as result;