-- 초기 데이터 삽입 스크립트

-- 1. categories 초기 데이터 삽입
INSERT INTO public.categories (name, post_count, is_hot, icon, description) VALUES
('아기 수유 고민', 124, true, '🍼', '신생아 및 영아 수유 관련 고민과 노하우'),
('이유식 거부', 89, true, '🥄', '이유식을 거부하는 아기들을 위한 해결책'),
('밤수유 노하우', 78, false, '🌙', '밤수유를 편하게 하는 방법들'),
('변비 과열', 67, false, '💊', '아기 변비 해결법과 관련 정보'),
('놀이 활동', 56, false, '🧸', '월령별 놀이 활동과 발달 놀이'),
('둘째 조작', 45, false, '👶', '둘째 아이 키우기와 형제 관계'),
('육아휴직 복직', 34, false, '💼', '육아휴직 후 직장 복귀 관련'),
('모유수유 노하우', 23, false, '🤱', '모유수유 성공을 위한 팁')
ON CONFLICT (name) DO UPDATE SET
  post_count = EXCLUDED.post_count,
  is_hot = EXCLUDED.is_hot,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- 2. groups 초기 데이터 삽입
INSERT INTO public.groups (name, description, member_count, is_public, icon, color) VALUES
('신생아맘 모임', '0-6개월 신생아를 키우는 엄마들의 정보 공유 모임입니다. 수유, 잠자리, 발달 등 신생아 육아의 모든 것을 함께 나눠요.', 124, true, '👶', 'purple'),
('이유식 레시피', '이유식 레시피 공유와 노하우를 나누는 그룹입니다. 초기부터 완료기까지 다양한 레시피와 팁을 공유해요.', 89, true, '🍼', 'green'),
('워킹맘 라이프', '일과 육아를 병행하는 워킹맘들의 소통 공간입니다. 시간 관리, 육아 팁, 스트레스 관리법을 함께 나눠요.', 156, true, '💼', 'blue'),
('아빠 육아단', '육아에 적극적으로 참여하는 아빠들의 모임입니다. 아빠만의 육아 노하우와 경험담을 공유해요.', 67, true, '👨', 'orange')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  member_count = EXCLUDED.member_count,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- 3. 기존 profiles 업데이트 (포인트 시스템 추가)
UPDATE public.profiles SET
  points = 1250,
  level = 3,
  ranking = 42,
  next_badge_points = 250,
  followers_count = 15,
  following_count = 23
WHERE points IS NULL OR points = 0;