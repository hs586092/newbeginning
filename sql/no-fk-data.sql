-- =============================================
-- Foreign Key 제약 조건 우회 버전
-- user_id를 NULL로 설정 (만약 NULL 허용이라면)
-- =============================================

BEGIN;

-- 방법 1: user_id를 NULL로 설정 (테스트)
INSERT INTO posts (id, user_id, author_name, title, content, category, is_question, baby_month, view_count, created_at) VALUES

('550e8400-e29b-41d4-a716-446655440001', NULL, '민주맘', '신생아 목욕 꿀팁', 
 '첫째 때는 정말 무서웠는데, 이제 둘째하면서 깨달은 신생아 목욕 꿀팁들이 있어요.', 
 'newborn', false, 1, 124, NOW() - INTERVAL '2 days'),

('550e8400-e29b-41d4-a716-446655440002', NULL, '현우아빠', '이유식 거부 해결법', 
 '12개월 첫째가 이유식을 정말 안 먹어서 고생했는데, 지금은 잘 먹어요!', 
 'toddler', false, 12, 89, NOW() - INTERVAL '1 day'),

('550e8400-e29b-41d4-a716-446655440003', NULL, '재현파파', '밤중 수유 방법', 
 '4개월 아기 아빠입니다. 밤중 수유할 때 정말 힘들잖아요.', 
 'newborn', false, 4, 67, NOW() - INTERVAL '3 hours'),

('550e8400-e29b-41d4-a716-446655440004', NULL, '한할머니', '육아 지혜', 
 '50년 넘게 아이들을 지켜본 할머니로서 말씀드려요.', 
 'expert', false, null, 203, NOW() - INTERVAL '1 week'),

('550e8400-e29b-41d4-a716-446655440005', NULL, '영파파', '18개월 아이 놀이', 
 '비오는 날 집에서 18개월 아들과 뭘 할지 고민하다가 찾은 놀이들이에요!', 
 'toddler', false, 18, 78, NOW() - INTERVAL '2 days');

COMMIT;

SELECT '✅ 5개 샘플 게시글 생성 완료 (user_id NULL)!' as result;