-- Basic database setup for real-time feed
-- Run this in Supabase SQL Editor

-- 1. Create posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('job_offer', 'job_seek', 'community', 'pregnancy_info', 'parenting_guide', 'health_tips', 'nutrition_guide', 'development_info', 'safety_tips')),
    company TEXT,
    location TEXT,
    salary TEXT,
    contact TEXT,
    deadline TEXT,
    image_url TEXT,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- 4. Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
-- Posts - everyone can read, authenticated users can create/update their own
CREATE POLICY "Posts are viewable by everyone"
ON public.posts FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
USING (auth.uid() = user_id);

-- Profiles - everyone can read, users can update their own
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Likes - everyone can read, authenticated users can manage their own
CREATE POLICY "Likes are viewable by everyone"
ON public.likes FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own likes"
ON public.likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.likes FOR DELETE
USING (auth.uid() = user_id);

-- Comments - everyone can read, authenticated users can manage their own
CREATE POLICY "Comments are viewable by everyone"
ON public.comments FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS posts_category_idx ON public.posts(category);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS likes_post_id_idx ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);

-- 8. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Add triggers
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Insert sample data for testing (only if no posts exist)
INSERT INTO public.posts (user_id, author_name, title, content, category, company, location, salary, contact, deadline)
SELECT
    '00000000-0000-0000-0000-000000000000'::uuid,
    '테스트사용자',
    '프론트엔드 개발자 구인',
    'React와 TypeScript 경험이 있는 프론트엔드 개발자를 찾습니다. 원격근무 가능하며, 유연한 근무시간을 제공합니다.',
    'job_offer',
    '테크스타트업',
    '서울 강남구',
    '4000-6000만원',
    'recruit@techstartup.com',
    '2024-12-31'
WHERE NOT EXISTS (SELECT 1 FROM public.posts LIMIT 1);

INSERT INTO public.posts (user_id, author_name, title, content, category)
SELECT
    '00000000-0000-0000-0000-000000000000'::uuid,
    '개발자김씨',
    '백엔드 개발 경험 공유',
    'Node.js와 PostgreSQL로 RESTful API를 구축한 경험을 공유합니다. 특히 대용량 데이터 처리와 최적화에 대한 이야기를 나누고 싶어요.',
    'community'
WHERE NOT EXISTS (SELECT 1 FROM public.posts WHERE category = 'community' LIMIT 1);

INSERT INTO public.posts (user_id, author_name, title, content, category)
SELECT
    '00000000-0000-0000-0000-000000000000'::uuid,
    '신입개발자',
    '신입 개발자 구직 중',
    '컴퓨터공학과 졸업 예정이며, React와 Spring Boot를 활용한 프로젝트 경험이 있습니다. 성장할 수 있는 환경을 찾고 있어요.',
    'job_seek'
WHERE NOT EXISTS (SELECT 1 FROM public.posts WHERE category = 'job_seek' LIMIT 1);

-- 11. Create a test profile
INSERT INTO public.profiles (id, username, full_name)
SELECT
    '00000000-0000-0000-0000-000000000000'::uuid,
    '테스트사용자',
    '테스트 사용자'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name;
