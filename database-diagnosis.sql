-- =============================================
-- 데이터베이스 현재 상태 진단 스크립트
-- =============================================

-- 1. 테이블 존재 확인
SELECT 
    '=== 테이블 존재 확인 ===' as check_type,
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('comments', 'profiles', 'posts', 'comment_likes')
ORDER BY table_name;

-- 2. comments 테이블 구조 확인
SELECT 
    '=== comments 테이블 구조 ===' as check_type,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'comments'
ORDER BY ordinal_position;

-- 3. profiles 테이블 구조 확인
SELECT 
    '=== profiles 테이블 구조 ===' as check_type,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. 외래키 관계 확인
SELECT 
    '=== 외래키 관계 확인 ===' as check_type,
    tc.table_name as from_table, 
    kcu.column_name as from_column,
    ccu.table_name as to_table,
    ccu.column_name as to_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 5. RLS 정책 확인
SELECT 
    '=== RLS 정책 확인 ===' as check_type,
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('comments', 'profiles', 'comment_likes')
ORDER BY tablename, policyname;

-- 6. 인덱스 확인
SELECT 
    '=== 인덱스 확인 ===' as check_type,
    t.relname as table_name,
    i.relname as index_name,
    a.attname as column_name
FROM pg_class t,
     pg_class i,
     pg_index ix,
     pg_attribute a
WHERE t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND a.attnum = ANY(ix.indkey)
  AND t.relkind = 'r'
  AND t.relname IN ('comments', 'profiles', 'comment_likes')
ORDER BY t.relname, i.relname;

-- 7. 함수/트리거 확인
SELECT 
    '=== 트리거 및 함수 확인 ===' as check_type,
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('comments', 'profiles')
ORDER BY event_object_table;

-- 8. 데이터 샘플 확인
SELECT '=== comments 데이터 샘플 ===' as check_type, COUNT(*) as record_count FROM comments;
SELECT '=== profiles 데이터 샘플 ===' as check_type, COUNT(*) as record_count FROM profiles;

-- 완료 메시지
SELECT '🔍 데이터베이스 진단 완료' as result;