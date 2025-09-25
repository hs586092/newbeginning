-- posts 테이블과 profiles 테이블에 누락된 컬럼 추가

-- 1. posts 테이블에 baby_month 컬럼 추가 (게시글 작성 시 필요)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'baby_month') THEN
        ALTER TABLE public.posts ADD COLUMN baby_month INTEGER;
    END IF;
END $$;

-- 2. profiles 테이블에 parenting_stage 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'parenting_stage') THEN
        ALTER TABLE public.profiles ADD COLUMN parenting_stage VARCHAR(50) DEFAULT 'planning';
    END IF;
END $$;

-- 3. posts 테이블에 다른 필요한 컬럼들도 확인 후 추가
DO $$
BEGIN
    -- category 컬럼 확인
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'category') THEN
        ALTER TABLE public.posts ADD COLUMN category VARCHAR(100);
    END IF;

    -- is_anonymous 컬럼 확인
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_anonymous') THEN
        ALTER TABLE public.posts ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
    END IF;

    -- tags 컬럼 확인
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'tags') THEN
        ALTER TABLE public.posts ADD COLUMN tags TEXT[];
    END IF;

    -- likes_count 컬럼 확인
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'likes_count') THEN
        ALTER TABLE public.posts ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;

    -- comments_count 컬럼 확인
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comments_count') THEN
        ALTER TABLE public.posts ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;

    -- views_count 컬럼 확인
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'views_count') THEN
        ALTER TABLE public.posts ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 4. 기존 posts 데이터에 기본값 설정
UPDATE public.posts SET
    baby_month = 12,
    category = '일반',
    is_anonymous = false,
    likes_count = 0,
    comments_count = 0,
    views_count = 0,
    tags = ARRAY[]::TEXT[]
WHERE baby_month IS NULL OR category IS NULL;

-- 5. 기존 profiles 데이터에 기본값 설정
UPDATE public.profiles SET
    parenting_stage = 'newborn'
WHERE parenting_stage IS NULL OR parenting_stage = '';

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_posts_baby_month ON public.posts(baby_month);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_profiles_parenting_stage ON public.profiles(parenting_stage);