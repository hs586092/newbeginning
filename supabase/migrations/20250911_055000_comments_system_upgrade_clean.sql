-- Migration: Comments System with 2-level nesting (Clean version)
-- Created: 2025-09-11T05:50:00.000Z
-- Features: 2-level nested comments, real-time, RLS

-- 1. Comments 테이블에 누락된 컬럼 추가
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 2. 새로운 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS comments_parent_comment_id_idx ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS comments_post_id_created_at_idx ON comments(post_id, created_at DESC);

-- 3. 댓글 길이 제한 추가
ALTER TABLE comments 
ADD CONSTRAINT comments_content_length 
CHECK (length(content) >= 1 AND length(content) <= 1000);

-- 4. RLS 정책 활성화 및 설정
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;