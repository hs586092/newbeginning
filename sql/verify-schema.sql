-- 전체 스키마 검증: 각 테이블의 정확한 구조 확인

-- Comments 테이블 구조
SELECT 
    'comments' as table_name,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'comments'
ORDER BY ordinal_position;

-- Posts 테이블 구조 (참조용)
SELECT 
    'posts' as table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'posts'
ORDER BY ordinal_position;

-- Profiles 테이블 구조 (참조용)  
SELECT 
    'profiles' as table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;