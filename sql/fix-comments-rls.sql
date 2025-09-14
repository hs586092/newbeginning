-- Comments 테이블 RLS 정책 수정

-- 1. 기존 정책들 삭제 (있다면)
DROP POLICY IF EXISTS "Users can view all comments" ON comments;
DROP POLICY IF EXISTS "Users can create their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- 2. RLS 활성화 (이미 되어있을 수도 있음)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 3. 새로운 RLS 정책 생성
-- 모든 사용자가 모든 댓글을 볼 수 있도록
CREATE POLICY "Users can view all comments" ON comments
    FOR SELECT USING (true);

-- 로그인한 사용자가 댓글을 작성할 수 있도록
CREATE POLICY "Users can create their own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 자신의 댓글만 수정할 수 있도록
CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 자신의 댓글만 삭제할 수 있도록
CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- 4. 정책 적용 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'comments';