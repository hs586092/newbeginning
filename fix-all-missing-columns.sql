-- posts 테이블에 모든 누락된 컬럼들 추가

-- 1. is_question 컬럼 추가 (가장 최근 에러)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_question') THEN
        ALTER TABLE public.posts ADD COLUMN is_question BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. 추가로 필요한 다른 컬럼들 확인 및 추가
DO $$
BEGIN
    -- image_url 컬럼
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'image_url') THEN
        ALTER TABLE public.posts ADD COLUMN image_url TEXT;
    END IF;

    -- author_name 컬럼 (익명 게시글을 위해)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_name') THEN
        ALTER TABLE public.posts ADD COLUMN author_name VARCHAR(100);
    END IF;

    -- status 컬럼 (게시글 상태)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'status') THEN
        ALTER TABLE public.posts ADD COLUMN status VARCHAR(20) DEFAULT 'published';
    END IF;

    -- is_pinned 컬럼 (고정 게시글)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_pinned') THEN
        ALTER TABLE public.posts ADD COLUMN is_pinned BOOLEAN DEFAULT false;
    END IF;

    -- last_activity_at 컬럼 (마지막 활동 시간)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'last_activity_at') THEN
        ALTER TABLE public.posts ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;

    -- metadata 컬럼 (JSON 형태의 추가 메타데이터)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'metadata') THEN
        ALTER TABLE public.posts ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 3. 기존 posts 데이터에 기본값 설정
UPDATE public.posts SET
    is_question = false,
    status = 'published',
    is_pinned = false,
    last_activity_at = created_at,
    metadata = '{}'::jsonb
WHERE is_question IS NULL
   OR status IS NULL
   OR is_pinned IS NULL
   OR last_activity_at IS NULL
   OR metadata IS NULL;

-- 4. 추가 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_is_question ON public.posts(is_question);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON public.posts(is_pinned DESC);
CREATE INDEX IF NOT EXISTS idx_posts_last_activity ON public.posts(last_activity_at DESC);

-- 5. RLS 정책 확인 (posts 테이블)
DO $$
BEGIN
    -- posts 테이블 RLS 활성화
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'posts' AND n.nspname = 'public' AND c.relrowsecurity = true) THEN
        ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- posts 정책들
DROP POLICY IF EXISTS "Everyone can view published posts" ON public.posts;
CREATE POLICY "Everyone can view published posts" ON public.posts FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);