'use client'

import { useState, useEffect } from 'react'
import { PostList } from '@/components/posts/post-list'
import { PostListSkeleton } from '@/components/posts/post-list-skeleton'
import { createClient } from '@/lib/supabase/client'
import type { PostWithDetails } from '@/types/database.types'

interface ClientPostsWrapperProps {
  searchParams: { [key: string]: string | undefined }
  currentUserId?: string
}

export default function ClientPostsWrapper({ searchParams, currentUserId }: ClientPostsWrapperProps) {
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true)
        
        // 기본 쿼리 - 모든 게시글
        let query = supabase
          .from('posts')
          .select(`
            *,
            profiles!posts_user_id_fkey (
              username,
              avatar_url
            ),
            likes (id),
            comments (id),
            educational_metadata (*)
          `)
        
        // 검색 파라미터 적용
        const { q: searchQuery, category, location } = searchParams
        
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        }
        
        if (category && category !== 'all') {
          query = query.eq('category', category)
        }
        
        if (location) {
          query = query.ilike('location', `%${location}%`)
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) {
          console.error('Posts loading error:', error)
          setError('글을 불러오는 중 오류가 발생했습니다.')
        } else {
          setPosts(data || [])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('예상치 못한 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [searchParams, supabase])

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-2">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <PostList 
      posts={posts}
      currentUserId={currentUserId}
      isLoading={isLoading}
      emptyMessage={
        Object.keys(searchParams).length > 0
          ? "검색 조건에 맞는 게시글이 없습니다."
          : "아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!"
      }
    />
  )
}