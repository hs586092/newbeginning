-- =============================================
-- 최종 안전 데이터 - baby_month 0-24개월만 사용
-- =============================================

BEGIN;

DO $$
DECLARE
    current_user_id uuid;
BEGIN
    SELECT auth.uid() INTO current_user_id;
    IF current_user_id IS NULL THEN
        current_user_id := gen_random_uuid();
    END IF;

    INSERT INTO posts (id, user_id, author_name, title, content, category, is_question, baby_month, view_count, created_at) VALUES
    
    (gen_random_uuid(), current_user_id, '민주맘', '신생아 목욕 꿀팁', 
     '첫째 때는 정말 무서웠는데, 이제 둘째하면서 깨달은 신생아 목욕 꿀팁들이 있어요.', 
     'newborn', false, 1, 124, NOW() - INTERVAL '2 days'),

    (gen_random_uuid(), current_user_id, '현우아빠', '이유식 거부 해결법', 
     '12개월 첫째가 이유식을 정말 안 먹어서 고생했는데, 지금은 잘 먹어요!', 
     'toddler', false, 12, 89, NOW() - INTERVAL '1 day'),

    (gen_random_uuid(), current_user_id, '재현파파', '밤중 수유 방법', 
     '4개월 아기 아빠입니다. 밤중 수유할 때 정말 힘들잖아요.', 
     'newborn', false, 4, 67, NOW() - INTERVAL '3 hours'),

    (gen_random_uuid(), current_user_id, '한할머니', '육아 지혜', 
     '50년 넘게 아이들을 지켜본 할머니로서 말씀드려요.', 
     'expert', false, null, 203, NOW() - INTERVAL '1 week'),

    (gen_random_uuid(), current_user_id, '영파파', '18개월 아이 놀이', 
     '비오는 날 집에서 18개월 아들과 뭘 할지 고민하다가 찾은 놀이들이에요!', 
     'toddler', false, 18, 78, NOW() - INTERVAL '2 days'),

    (gen_random_uuid(), current_user_id, '소영이', '첫 임신 질문', 
     '첫 임신이라 모든 게 낯설고 불안해요. 조언을 구합니다!', 
     'expecting', true, null, 134, NOW() - INTERVAL '6 hours'),

    (gen_random_uuid(), current_user_id, '민주맘', '수면패턴 고민', 
     '생후 1개월 아기인데 아직도 밤낮이 바뀌어 있어요.', 
     'newborn', true, 1, 87, NOW() - INTERVAL '12 hours'),

    (gen_random_uuid(), current_user_id, '민주맘', '강남구 엄마 모임', 
     '강남구에 사시는 신생아 엄마들과 함께 모임을 만들고 싶어요!', 
     'community', false, null, 67, NOW() - INTERVAL '2 days');

END $$;

COMMIT;

SELECT '✅ 8개 게시글 추가 완료!' as result;