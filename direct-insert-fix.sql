-- 직접 데이터 삽입 - 기존 사용자 ID 확인 후 사용
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- 기존 게시글에서 user_id 가져오기 (test 글의 user_id 사용)
    SELECT user_id INTO target_user_id FROM posts LIMIT 1;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION '기존 게시글이 없습니다. 먼저 로그인 후 글을 작성해주세요.';
    END IF;
    
    -- 샘플 데이터 삽입 (기존 user_id 사용)
    INSERT INTO posts (id, user_id, author_name, title, content, category, is_question, baby_month, view_count, created_at) VALUES
    
    ('11111111-1111-1111-1111-111111111111', target_user_id, '민주맘', '신생아 목욕 꿀팁', 
     '첫째 때는 정말 무서웠는데, 이제 둘째하면서 깨달은 신생아 목욕 꿀팁들이 있어요. 물온도는 37-38도가 적당하고, 목욕시간은 5분 이내로 짧게 하세요.', 
     'newborn', false, 1, 124, NOW() - INTERVAL '2 days'),

    ('22222222-2222-2222-2222-222222222222', target_user_id, '현우아빠', '이유식 거부 해결법', 
     '12개월 첫째가 이유식을 정말 안 먹어서 고생했는데, 지금은 잘 먹어요! 아이와 함께 먹으면서 재미있게 해보세요.', 
     'toddler', false, 12, 89, NOW() - INTERVAL '1 day'),

    ('33333333-3333-3333-3333-333333333333', target_user_id, '재현파파', '밤중 수유 꿀팁', 
     '4개월 아기 아빠입니다. 밤중 수유할 때 조명을 어둡게 하고, 말을 최소화하면 아기가 다시 쉽게 잠들어요.', 
     'newborn', false, 4, 67, NOW() - INTERVAL '3 hours'),

    ('44444444-4444-4444-4444-444444444444', target_user_id, '은희맘', '18개월 놀이 추천', 
     '비오는 날 집에서 18개월 아들과 할 수 있는 놀이들! 쌀놀이, 박스놀이, 물놀이가 인기만점이에요.', 
     'toddler', false, 18, 78, NOW() - INTERVAL '2 days'),

    ('55555555-5555-5555-5555-555555555555', target_user_id, '한할머니', '50년 육아 지혜', 
     '50년 넘게 아이들을 키워본 할머니로서, 완벽하려 하지 마세요. 아이와 함께 성장하는 마음으로 육아하시길 바라요.', 
     'expert', false, null, 203, NOW() - INTERVAL '1 week');

    RAISE NOTICE '✅ 5개 샘플 게시글이 user_id %로 성공 삽입되었습니다!', target_user_id;

END $$;