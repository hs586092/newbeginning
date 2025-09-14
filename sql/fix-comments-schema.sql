-- Comments 테이블 스키마 수정: Production-Ready Schema

-- 1. updated_at 컬럼 추가
ALTER TABLE comments 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. post_id를 NOT NULL로 변경 (댓글은 반드시 포스트에 속해야 함)
-- 먼저 NULL 데이터가 있는지 확인
SELECT COUNT(*) as null_post_id_count FROM comments WHERE post_id IS NULL;

-- NULL 데이터가 없다면 NOT NULL 제약 조건 추가
ALTER TABLE comments 
ALTER COLUMN post_id SET NOT NULL;

-- 3. updated_at 자동 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

-- 4. 트리거 적용
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. 외래 키 제약 조건 확인/추가 (데이터 무결성)
ALTER TABLE comments 
ADD CONSTRAINT fk_comments_post_id 
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT fk_comments_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 6. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 7. 수정 결과 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'comments'
ORDER BY ordinal_position;