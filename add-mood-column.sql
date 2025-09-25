-- posts 테이블에 mood 컬럼 추가

-- mood 컬럼 추가 (게시글 기분/감정 상태)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'mood') THEN
        ALTER TABLE public.posts ADD COLUMN mood VARCHAR(50);
    END IF;
END $$;

-- 기존 posts 데이터에 기본값 설정
UPDATE public.posts SET mood = 'normal' WHERE mood IS NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_posts_mood ON public.posts(mood);