-- Comments 테이블 RLS 정책 완전 정리 및 재설정

-- 1. 모든 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can create their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can view all comments" ON comments;
DROP POLICY IF EXISTS "댓글 작성자만 삭제 가능" ON comments;
DROP POLICY IF EXISTS "댓글 작성자만 수정 가능" ON comments;
DROP POLICY IF EXISTS "댓글 조회 허용" ON comments;
DROP POLICY IF EXISTS "인증된 사용자 댓글 작성" ON comments;

-- 2. RLS는 그대로 유지
-- ALTER TABLE comments ENABLE ROW LEVEL SECURITY; (이미 활성화됨)

-- 3. 깔끔한 새 정책 4개만 생성
-- 조회: 모든 사용자 허용
CREATE POLICY "comments_select_policy" ON comments
    FOR SELECT USING (true);

-- 생성: 로그인한 사용자만
CREATE POLICY "comments_insert_policy" ON comments
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 수정: 본인 댓글만
CREATE POLICY "comments_update_policy" ON comments
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 삭제: 본인 댓글만
CREATE POLICY "comments_delete_policy" ON comments
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 4. 정책 적용 확인
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'comments'
ORDER BY cmd, policyname;