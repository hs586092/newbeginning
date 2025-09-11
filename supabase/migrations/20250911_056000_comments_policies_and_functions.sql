-- Migration: Comments RLS policies and functions
-- Created: 2025-09-11T05:60:00.000Z
-- Features: RLS policies, real-time functions, triggers

-- 댓글 정책 생성
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create comments" ON comments 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own comments" ON comments 
    FOR UPDATE USING (auth.uid() = user_id);

-- 좋아요 정책 설정
CREATE POLICY "Anyone can view comment likes" ON comment_likes FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can like comments" ON comment_likes 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can unlike their own likes" ON comment_likes 
    FOR DELETE USING (auth.uid() = user_id);