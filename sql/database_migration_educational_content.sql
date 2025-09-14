-- Educational Content Migration
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. posts 테이블의 category enum 확장
ALTER TYPE post_category ADD VALUE IF NOT EXISTS 'pregnancy_info';
ALTER TYPE post_category ADD VALUE IF NOT EXISTS 'parenting_guide';
ALTER TYPE post_category ADD VALUE IF NOT EXISTS 'health_tips';
ALTER TYPE post_category ADD VALUE IF NOT EXISTS 'nutrition_guide';
ALTER TYPE post_category ADD VALUE IF NOT EXISTS 'development_info';
ALTER TYPE post_category ADD VALUE IF NOT EXISTS 'safety_tips';

-- 2. educational_metadata 테이블 생성
CREATE TABLE IF NOT EXISTS public.educational_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    display_priority INTEGER DEFAULT 0,
    target_audience TEXT CHECK (target_audience IN ('expecting_parents', 'new_parents', 'toddler_parents', 'all_parents')) NOT NULL,
    content_type TEXT CHECK (content_type IN ('article', 'infographic', 'checklist', 'guide', 'tips')) NOT NULL,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    estimated_read_time INTEGER DEFAULT 5,
    keywords TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    expert_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE public.educational_metadata ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성 (모든 사용자가 읽기 가능)
CREATE POLICY "Educational metadata is viewable by everyone" 
ON public.educational_metadata FOR SELECT 
USING (true);

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS educational_metadata_post_id_idx ON public.educational_metadata(post_id);
CREATE INDEX IF NOT EXISTS educational_metadata_display_priority_idx ON public.educational_metadata(display_priority);
CREATE INDEX IF NOT EXISTS educational_metadata_is_featured_idx ON public.educational_metadata(is_featured);
CREATE INDEX IF NOT EXISTS educational_metadata_target_audience_idx ON public.educational_metadata(target_audience);

-- 6. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_educational_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER educational_metadata_updated_at_trigger
    BEFORE UPDATE ON public.educational_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_educational_metadata_updated_at();

-- 7. 샘플 정보 컨텐츠 삽입 (선택사항)
-- 샘플 pregnancy_info 게시물
INSERT INTO public.posts (user_id, author_name, title, content, category) VALUES
('00000000-0000-0000-0000-000000000000', '육아전문가', '임신 초기 주의사항 가이드', 
'임신 초기 3개월 동안 특별히 주의해야 할 사항들을 정리했습니다.

🤱 **영양 섭취**
- 엽산 400㎍/일 섭취 필수
- 카페인 하루 200mg 이하로 제한
- 생선은 주 2-3회, 수은 함량 높은 생선 피하기

⚠️ **피해야 할 것들**
- 흡연, 음주 완전 금지
- 생육, 생선회 등 날것 섭취 금지
- 과도한 비타민 A 섭취 주의

💊 **필수 검사**
- 기형아 검사 (11-13주)
- 융모막 검사 (10-12주)
- 임신성 당뇨 검사 (24-28주)

궁금한 점이 있으시면 언제든 병원에 문의하세요!', 'pregnancy_info')
ON CONFLICT DO NOTHING;

-- 샘플 메타데이터 삽입
INSERT INTO public.educational_metadata (
    post_id, 
    display_priority, 
    target_audience, 
    content_type, 
    difficulty_level,
    estimated_read_time,
    keywords,
    is_featured,
    expert_verified
) SELECT 
    p.id,
    10,
    'expecting_parents',
    'guide',
    'beginner',
    3,
    ARRAY['임신초기', '주의사항', '영양', '검사'],
    true,
    true
FROM public.posts p 
WHERE p.title = '임신 초기 주의사항 가이드'
ON CONFLICT DO NOTHING;