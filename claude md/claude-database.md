# Database Guide - NewBeginning

> 🎯 **Supabase 패턴, RPC 함수, 데이터베이스 최적화 가이드**

---

## 📚 목차

1. [Supabase 아키텍처](#supabase-아키텍처)
2. [데이터베이스 스키마](#데이터베이스-스키마)
3. [RLS (Row Level Security)](#rls-row-level-security)
4. [RPC 함수 패턴](#rpc-함수-패턴)
5. [쿼리 최적화](#쿼리-최적화)
6. [실시간 구독](#실시간-구독)
7. [트랜잭션 처리](#트랜잭션-처리)
8. [백업 & 마이그레이션](#백업--마이그레이션)

---

## 🏗️ Supabase 아키텍처

### 클라이언트 설정
```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

// 클라이언트 컴포넌트용
export const createClient = () => createClientComponentClient<Database>()

// 서버 컴포넌트용
export const createServerClient = () => 
  createServerComponentClient<Database>({ cookies })

// 라우트 핸들러용
export { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
```

### 환경 변수 설정
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 📊 데이터베이스 스키마

### 주요 테이블 구조
```sql
-- 프로필 테이블 (사용자 확장 정보)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  -- 임신/육아 관련 정보
  parenting_stage TEXT CHECK (parenting_stage IN (
    'expecting', 'newborn', 'infant', 'toddler', 
    'preschool', 'school_age', 'teen', 'adult_child'
  )),
  parenting_role TEXT CHECK (parenting_role IN (
    'mother', 'father', 'guardian', 'caregiver', 
    'grandparent', 'expecting_parent'
  )),
  location TEXT,
  timezone TEXT DEFAULT 'Asia/Seoul',
  language_preference TEXT DEFAULT 'ko',
  
  -- JSON 필드들
  baby_info JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{
    "show_location": true,
    "show_children_info": false,
    "allow_messages": true
  }'::jsonb,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- 게시글 테이블
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL, -- 비정규화로 성능 최적화
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'community', 'expecting', 'newborn', 'toddler', 'expert'
  )),
  image_url TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  -- 임신/육아 특화 필드
  is_question BOOLEAN DEFAULT false,
  baby_month INTEGER CHECK (baby_month >= 0 AND baby_month <= 36),
  tags TEXT[] DEFAULT '{}',
  mood TEXT,
  
  CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 5000)
);

-- 댓글 테이블 (계층 구조 지원)
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  -- 최대 3단계 깊이만 허용
  CONSTRAINT max_nesting_depth CHECK (
    parent_comment_id IS NULL OR 
    (SELECT parent_comment_id FROM comments WHERE id = parent_comment_id) IS NULL OR
    (SELECT parent_comment_id FROM comments WHERE id = 
     (SELECT parent_comment_id FROM comments WHERE id = parent_comment_id)) IS NULL
  )
);

-- 좋아요 테이블
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  UNIQUE(post_id, user_id) -- 중복 좋아요 방지
);

-- 댓글 좋아요 테이블
CREATE TABLE comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  UNIQUE(comment_id, user_id)
);
```

### 인덱스 최적화
```sql
-- 성능 최적화를 위한 인덱스들
CREATE INDEX idx_posts_category_created ON posts(category, created_at DESC);
CREATE INDEX idx_posts_user_id_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_baby_month ON posts(baby_month) WHERE baby_month IS NOT NULL;
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_full_text ON posts USING GIN(to_tsvector('korean', title || ' ' || content));

CREATE INDEX idx_comments_post_id_created ON comments(post_id, created_at DESC);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_comments_user_id ON comments(user_id);

CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);

-- 프로필 검색용
CREATE INDEX idx_profiles_username_trgm ON profiles USING GIN(username gin_trgm_ops);
CREATE INDEX idx_profiles_parenting_stage ON profiles(parenting_stage);
```

---

## 🔐 RLS (Row Level Security)

### 기본 RLS 정책
```sql
-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- 프로필 정책
CREATE POLICY "프로필은 누구나 읽을 수 있다" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "사용자는 자신의 프로필만 수정할 수 있다" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필만 삭제할 수 있다" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- 게시글 정책
CREATE POLICY "게시글은 누구나 읽을 수 있다" ON posts
  FOR SELECT USING (true);

CREATE POLICY "로그인한 사용자는 게시글을 생성할 수 있다" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "작성자만 자신의 게시글을 수정할 수 있다" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "작성자만 자신의 게시글을 삭제할 수 있다" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- 댓글 정책
CREATE POLICY "댓글은 누구나 읽을 수 있다" ON comments
  FOR SELECT USING (NOT is_deleted);

CREATE POLICY "로그인한 사용자는 댓글을 생성할 수 있다" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "작성자만 자신의 댓글을 수정할 수 있다" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- 좋아요 정책 (사용자는 자신의 좋아요만 관리)
CREATE POLICY "좋아요는 누구나 읽을 수 있다" ON likes
  FOR SELECT USING (true);

CREATE POLICY "로그인한 사용자는 좋아요를 추가할 수 있다" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 좋아요만 삭제할 수 있다" ON likes
  FOR DELETE USING (auth.uid() = user_id);
```

### 동적 RLS 정책 (고급)
```sql
-- 프라이버시 설정에 따른 동적 정책
CREATE OR REPLACE FUNCTION can_view_profile(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  privacy_settings JSONB;
  is_owner BOOLEAN;
BEGIN
  -- 자신의 프로필은 항상 볼 수 있음
  IF auth.uid() = target_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- 프라이버시 설정 확인
  SELECT 
    profiles.privacy_settings,
    auth.uid() = profiles.id
  INTO privacy_settings, is_owner
  FROM profiles 
  WHERE profiles.id = target_user_id;
  
  -- 위치 정보 표시 여부
  IF (privacy_settings->>'show_location')::boolean = false AND NOT is_owner THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 조건부 필드 표시 정책
CREATE POLICY "프라이버시 설정에 따른 프로필 조회" ON profiles
  FOR SELECT USING (can_view_profile(id));
```

---

## ⚡ RPC 함수 패턴

### 복합 쿼리를 위한 RPC 함수
```sql
-- 게시글 상세 조회 (좋아요, 댓글 수 포함)
CREATE OR REPLACE FUNCTION get_post_with_details(post_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  author_name TEXT,
  title TEXT,
  content TEXT,
  category TEXT,
  image_url TEXT,
  view_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  baby_month INTEGER,
  tags TEXT[],
  mood TEXT,
  -- 관련 정보
  author_username TEXT,
  author_avatar TEXT,
  like_count BIGINT,
  comment_count BIGINT,
  user_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.author_name,
    p.title,
    p.content,
    p.category,
    p.image_url,
    p.view_count,
    p.created_at,
    p.updated_at,
    p.baby_month,
    p.tags,
    p.mood,
    -- 작성자 정보
    pr.username,
    pr.avatar_url,
    -- 좋아요 수
    COALESCE(l.like_count, 0) as like_count,
    -- 댓글 수  
    COALESCE(c.comment_count, 0) as comment_count,
    -- 현재 사용자의 좋아요 여부
    CASE WHEN ul.user_id IS NOT NULL THEN true ELSE false END as user_liked
  FROM posts p
  LEFT JOIN profiles pr ON pr.id = p.user_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM likes
    GROUP BY post_id
  ) l ON l.post_id = p.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count
    FROM comments
    WHERE NOT is_deleted
    GROUP BY post_id
  ) c ON c.post_id = p.id
  LEFT JOIN likes ul ON ul.post_id = p.id AND ul.user_id = auth.uid()
  WHERE p.id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 좋아요 토글 함수
CREATE OR REPLACE FUNCTION toggle_post_like(post_id UUID)
RETURNS TABLE (
  liked BOOLEAN,
  like_count BIGINT
) AS $$
DECLARE
  user_id UUID := auth.uid();
  existing_like UUID;
  new_count BIGINT;
  is_liked BOOLEAN;
BEGIN
  -- 인증 확인
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- 기존 좋아요 확인
  SELECT id INTO existing_like
  FROM likes
  WHERE likes.post_id = toggle_post_like.post_id 
    AND likes.user_id = toggle_post_like.user_id;

  IF existing_like IS NOT NULL THEN
    -- 좋아요 취소
    DELETE FROM likes WHERE id = existing_like;
    is_liked := false;
  ELSE
    -- 좋아요 추가
    INSERT INTO likes (post_id, user_id) 
    VALUES (toggle_post_like.post_id, user_id);
    is_liked := true;
  END IF;

  -- 업데이트된 좋아요 수 계산
  SELECT COUNT(*) INTO new_count
  FROM likes
  WHERE likes.post_id = toggle_post_like.post_id;

  RETURN QUERY SELECT is_liked, new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 댓글 계층 조회 함수
CREATE OR REPLACE FUNCTION get_comments_with_replies(post_id UUID)
RETURNS TABLE (
  id UUID,
  post_id UUID,
  user_id UUID,
  author_name TEXT,
  content TEXT,
  parent_comment_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  -- 추가 정보
  author_username TEXT,
  author_avatar TEXT,
  reply_count BIGINT,
  like_count BIGINT,
  user_liked BOOLEAN,
  depth INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE comment_tree AS (
    -- 루트 댓글들
    SELECT 
      c.*,
      pr.username,
      pr.avatar_url,
      0 as depth
    FROM comments c
    LEFT JOIN profiles pr ON pr.id = c.user_id
    WHERE c.post_id = get_comments_with_replies.post_id
      AND c.parent_comment_id IS NULL
      AND NOT c.is_deleted
    
    UNION ALL
    
    -- 대댓글들
    SELECT 
      c.*,
      pr.username,
      pr.avatar_url,
      ct.depth + 1
    FROM comments c
    LEFT JOIN profiles pr ON pr.id = c.user_id
    JOIN comment_tree ct ON c.parent_comment_id = ct.id
    WHERE NOT c.is_deleted
  )
  SELECT 
    ct.id,
    ct.post_id,
    ct.user_id,
    ct.author_name,
    ct.content,
    ct.parent_comment_id,
    ct.created_at,
    ct.updated_at,
    ct.username,
    ct.avatar_url,
    -- 답글 수
    COALESCE(r.reply_count, 0),
    -- 좋아요 수
    COALESCE(l.like_count, 0),
    -- 사용자 좋아요 여부
    CASE WHEN ul.user_id IS NOT NULL THEN true ELSE false END,
    ct.depth
  FROM comment_tree ct
  LEFT JOIN (
    SELECT parent_comment_id, COUNT(*) as reply_count
    FROM comments
    WHERE NOT is_deleted
    GROUP BY parent_comment_id
  ) r ON r.parent_comment_id = ct.id
  LEFT JOIN (
    SELECT comment_id, COUNT(*) as like_count
    FROM comment_likes
    GROUP BY comment_id
  ) l ON l.comment_id = ct.id
  LEFT JOIN comment_likes ul ON ul.comment_id = ct.id AND ul.user_id = auth.uid()
  ORDER BY ct.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 검색 최적화 RPC
```sql
-- 전문 검색 함수
CREATE OR REPLACE FUNCTION search_posts(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  created_at TIMESTAMPTZ,
  author_name TEXT,
  author_username TEXT,
  like_count BIGINT,
  comment_count BIGINT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content,
    p.category,
    p.created_at,
    p.author_name,
    pr.username,
    COALESCE(l.like_count, 0),
    COALESCE(c.comment_count, 0),
    ts_rank(
      to_tsvector('korean', p.title || ' ' || p.content),
      plainto_tsquery('korean', search_query)
    ) as rank
  FROM posts p
  LEFT JOIN profiles pr ON pr.id = p.user_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM likes GROUP BY post_id
  ) l ON l.post_id = p.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count
    FROM comments WHERE NOT is_deleted
    GROUP BY post_id
  ) c ON c.post_id = p.id
  WHERE 
    to_tsvector('korean', p.title || ' ' || p.content) @@ plainto_tsquery('korean', search_query)
    AND (category_filter IS NULL OR p.category = category_filter)
  ORDER BY rank DESC, p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🚀 쿼리 최적화

### TypeScript에서 효율적인 쿼리 작성
```typescript
// lib/database/queries.ts
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

export class PostQueries {
  private supabase = createClient()

  // ✅ 좋은 예: 필요한 필드만 선택
  async getPostsList(options: {
    category?: string
    limit?: number
    offset?: number
  } = {}) {
    const { category, limit = 20, offset = 0 } = options

    let query = this.supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        category,
        created_at,
        author_name,
        view_count,
        baby_month,
        profiles:user_id!inner (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query

    if (error) throw error

    return {
      posts: data || [],
      total: count || 0,
      hasMore: (data?.length || 0) === limit
    }
  }

  // ✅ RPC 함수 활용으로 N+1 쿼리 문제 해결
  async getPostWithDetails(postId: string) {
    const { data, error } = await this.supabase
      .rpc('get_post_with_details', { post_id: postId })
      .single()

    if (error) throw error
    return data
  }

  // ✅ 조건부 쿼리 최적화
  async getPostsByUser(userId: string, options: {
    includePrivate?: boolean
    category?: string
  } = {}) {
    const { includePrivate = false, category } = options

    let query = this.supabase
      .from('posts')
      .select(`
        id,
        title,
        category,
        created_at,
        view_count,
        ${includePrivate ? 'content,' : ''}
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // ✅ 배치 처리로 성능 최적화
  async batchUpdateViewCount(postIds: string[]) {
    const { data, error } = await this.supabase
      .rpc('increment_view_counts', { post_ids: postIds })

    if (error) throw error
    return data
  }
}

// 인스턴스 생성
export const postQueries = new PostQueries()
```

### 쿼리 캐싱 전략
```typescript
// lib/database/cache.ts
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl = 5 * 60 * 1000) { // 5분 기본 TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string) {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  invalidate(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

export const queryCache = new QueryCache()

// 캐시를 활용한 쿼리 래퍼
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  getKey: (...args: T) => string,
  ttl?: number
) {
  return async (...args: T): Promise<R> => {
    const key = getKey(...args)
    const cached = queryCache.get(key)
    
    if (cached) return cached

    const result = await fn(...args)
    queryCache.set(key, result, ttl)
    
    return result
  }
}

// 사용 예시
export const getCachedPosts = withCache(
  postQueries.getPostsList.bind(postQueries),
  (options) => `posts:list:${JSON.stringify(options)}`,
  5 * 60 * 1000 // 5분 캐시
)
```

---

## 🔄 실시간 구독

### Realtime 설정
```typescript
// lib/realtime/subscriptions.ts
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export class RealtimeManager {
  private supabase = createClient()
  private channels = new Map<string, RealtimeChannel>()

  // 게시글 실시간 구독
  subscribeToPost(postId: string, callbacks: {
    onLike?: (payload: any) => void
    onComment?: (payload: any) => void
    onUpdate?: (payload: any) => void
  }) {
    const channelId = `post:${postId}`
    
    if (this.channels.has(channelId)) {
      return this.channels.get(channelId)!
    }

    const channel = this.supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`
        },
        (payload) => callbacks.onLike?.(payload)
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => callbacks.onComment?.(payload)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`
        },
        (payload) => callbacks.onUpdate?.(payload)
      )
      .subscribe()

    this.channels.set(channelId, channel)
    return channel
  }

  // 채팅방 실시간 구독
  subscribeToChat(roomId: string, onMessage: (message: any) => void) {
    const channelId = `chat:${roomId}`
    
    const channel = this.supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          onMessage(payload.new)
        }
      )
      .subscribe()

    this.channels.set(channelId, channel)
    return channel
  }

  // 구독 해제
  unsubscribe(channelId: string) {
    const channel = this.channels.get(channelId)
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelId)
    }
  }

  // 모든 구독 해제
  unsubscribeAll() {
    for (const [channelId, channel] of this.channels) {
      channel.unsubscribe()
    }
    this.channels.clear()
  }
}

export const realtimeManager = new RealtimeManager()
```

### React에서 실시간 구독 Hook
```typescript
// hooks/useRealtimePost.ts
import { useEffect, useState } from 'react'
import { realtimeManager } from '@/lib/realtime/subscriptions'
import type { PostWithDetails } from '@/types/database.types'

export function useRealtimePost(postId: string, initialPost: PostWithDetails) {
  const [post, setPost] = useState(initialPost)

  useEffect(() => {
    const channel = realtimeManager.subscribeToPost(postId, {
      onLike: (payload) => {
        setPost(prev => ({
          ...prev,
          _count: {
            ...prev._count,
            likes: prev._count?.likes ? prev._count.likes + 1 : 1
          }
        }))
      },
      onComment: (payload) => {
        setPost(prev => ({
          ...prev,
          _count: {
            ...prev._count,
            comments: prev._count?.comments ? prev._count.comments + 1 : 1
          }
        }))
      },
      onUpdate: (payload) => {
        setPost(prev => ({
          ...prev,
          ...payload.new
        }))
      }
    })

    return () => {
      realtimeManager.unsubscribe(`post:${postId}`)
    }
  }, [postId])

  return post
}
```

---

## 🔄 트랜잭션 처리

### 복합 작업을 위한 트랜잭션
```sql
-- 게시글과 관련 데이터 생성 트랜잭션
CREATE OR REPLACE FUNCTION create_post_with_tags(
  p_title TEXT,
  p_content TEXT,
  p_category TEXT,
  p_tags TEXT[],
  p_baby_month INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_post_id UUID;
  user_profile RECORD;
BEGIN
  -- 사용자 프로필 확인
  SELECT username INTO user_profile
  FROM profiles
  WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- 게시글 생성
  INSERT INTO posts (
    user_id,
    author_name,
    title,
    content,
    category,
    tags,
    baby_month
  ) VALUES (
    auth.uid(),
    user_profile.username,
    p_title,
    p_content,
    p_category,
    p_tags,
    p_baby_month
  ) RETURNING id INTO new_post_id;

  -- 사용자 통계 업데이트 (예시)
  INSERT INTO user_stats (user_id, post_count)
  VALUES (auth.uid(), 1)
  ON CONFLICT (user_id)
  DO UPDATE SET post_count = user_stats.post_count + 1;

  RETURN new_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### TypeScript에서 트랜잭션 처리
```typescript
// lib/database/transactions.ts
export class TransactionManager {
  private supabase = createClient()

  async executeTransaction<T>(
    operations: (client: typeof this.supabase) => Promise<T>
  ): Promise<T> {
    try {
      // Supabase는 자동으로 트랜잭션을 관리하므로
      // RPC 함수를 사용하거나 단일 쿼리로 처리
      return await operations(this.supabase)
    } catch (error) {
      console.error('Transaction failed:', error)
      throw error
    }
  }

  // 복합 작업 예시: 게시글 삭제와 관련 데이터 정리
  async deletePostAndRelatedData(postId: string, userId: string) {
    return this.executeTransaction(async (client) => {
      // 1. 권한 확인
      const { data: post, error: postError } = await client
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      if (postError || !post) {
        throw new Error('게시글을 찾을 수 없습니다.')
      }

      if (post.user_id !== userId) {
        throw new Error('삭제 권한이 없습니다.')
      }

      // 2. 관련 데이터들이 CASCADE로 자동 삭제되므로 게시글만 삭제
      const { error: deleteError } = await client
        .from('posts')
        .delete()
        .eq('id', postId)

      if (deleteError) {
        throw deleteError
      }

      return { success: true }
    })
  }
}

export const transactionManager = new TransactionManager()
```

---

## 💾 백업 & 마이그레이션

### 정기 백업 전략
```sql
-- 백업 테이블 생성
CREATE TABLE backup_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type TEXT NOT NULL,
  table_name TEXT,
  record_count BIGINT,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT
);

-- 백업 함수 예시
CREATE OR REPLACE FUNCTION backup_table_data(
  table_name TEXT,
  backup_path TEXT
)
RETURNS UUID AS $$
DECLARE
  backup_id UUID;
  record_count BIGINT;
BEGIN
  -- 백업 로그 생성
  INSERT INTO backup_logs (backup_type, table_name, file_path)
  VALUES ('manual', table_name, backup_path)
  RETURNING id INTO backup_id;

  -- 여기서는 실제 백업 로직을 구현
  -- 실제로는 pg_dump 등의 외부 도구 사용
  
  -- 레코드 수 계산 (예시)
  EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO record_count;
  
  -- 백업 완료 업데이트
  UPDATE backup_logs
  SET record_count = record_count,
      completed_at = NOW(),
      status = 'completed'
  WHERE id = backup_id;

  RETURN backup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 마이그레이션 스크립트
```typescript
// scripts/migrations/001_add_user_stats.ts
export const migration001 = {
  up: async (supabase: any) => {
    // 사용자 통계 테이블 생성
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE user_stats (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
          post_count INTEGER DEFAULT 0,
          comment_count INTEGER DEFAULT 0,
          like_received_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
      `
    })

    // 기존 데이터로 통계 초기화
    await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO user_stats (user_id, post_count, comment_count, like_received_count)
        SELECT 
          p.id as user_id,
          COALESCE(posts.count, 0) as post_count,
          COALESCE(comments.count, 0) as comment_count,
          COALESCE(likes.count, 0) as like_received_count
        FROM profiles p
        LEFT JOIN (
          SELECT user_id, COUNT(*) as count
          FROM posts
          GROUP BY user_id
        ) posts ON posts.user_id = p.id
        LEFT JOIN (
          SELECT user_id, COUNT(*) as count
          FROM comments
          WHERE NOT is_deleted
          GROUP BY user_id
        ) comments ON comments.user_id = p.id
        LEFT JOIN (
          SELECT posts.user_id, COUNT(*) as count
          FROM likes
          JOIN posts ON posts.id = likes.post_id
          GROUP BY posts.user_id
        ) likes ON likes.user_id = p.id
        ON CONFLICT (user_id) DO NOTHING;
      `
    })
  },

  down: async (supabase: any) => {
    await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS user_stats;'
    })
  }
}
```

### 데이터베이스 모니터링
```typescript
// lib/database/monitoring.ts
export class DatabaseMonitor {
  private supabase = createClient()

  async checkTableSizes() {
    const { data, error } = await this.supabase.rpc('get_table_sizes')
    
    if (error) {
      console.error('Failed to get table sizes:', error)
      return null
    }

    return data
  }

  async getSlowQueries() {
    const { data, error } = await this.supabase.rpc('get_slow_queries')
    
    if (error) {
      console.error('Failed to get slow queries:', error)
      return null
    }

    return data
  }

  async checkIndexUsage() {
    const { data, error } = await this.supabase.rpc('check_unused_indexes')
    
    if (error) {
      console.error('Failed to check index usage:', error)
      return null
    }

    return data
  }
}

export const dbMonitor = new DatabaseMonitor()
```

---

**📝 마지막 업데이트**: 2025-09-13  
**🔄 다음 리뷰 예정**: 2025-10-13  
**📖 관련 문서**: [CLAUDE.md](./CLAUDE.md) | [claude-api.md](./claude-api.md) | [claude-security.md](./claude-security.md)