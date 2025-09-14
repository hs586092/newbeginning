-- Comments 테이블 구조만 상세 확인
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'comments'
ORDER BY ordinal_position;