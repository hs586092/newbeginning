'use client'

import { PostList } from '@/components/posts/post-list'
import { createClient } from '@/lib/supabase/client'
import type { PostWithDetails } from '@/types/database.types'
import { useEffect, useState } from 'react'

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
        setError(null)

        // Build query based on search parameters
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

        // Apply search filters
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
          .limit(50)

        if (error) {
          console.error('Posts loading error:', error)
          setError('글을 불러오는 중 오류가 발생했습니다.')
          // Fallback to demo data if database is not available
          setPosts(getDemoPosts())
        } else {
          setPosts(data || [])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('예상치 못한 오류가 발생했습니다.')
        // Fallback to demo data
        setPosts(getDemoPosts())
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [searchParams, supabase])

  // Demo data fallback function
  function getDemoPosts(): PostWithDetails[] {
    return [
      {
        id: 'demo-1',
        title: '프론트엔드 개발자 구인',
        content: 'React와 TypeScript 경험이 있는 프론트엔드 개발자를 찾습니다. 원격근무 가능하며, 유연한 근무시간을 제공합니다.',
        category: 'job_offer',
        company: '테크스타트업',
        location: '서울 강남구',
        salary: '4000-6000만원',
        contact: 'recruit@techstartup.com',
        deadline: '2024-12-31',
        user_id: 'demo-user-1',
        author_name: '인사팀장',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 15,
        profiles: {
          username: '인사팀장',
          avatar_url: undefined
        },
        likes: [],
        comments: []
      },
      {
        id: 'demo-2',
        title: '백엔드 개발 경험 공유',
        content: 'Node.js와 PostgreSQL로 RESTful API를 구축한 경험을 공유합니다. 특히 대용량 데이터 처리와 최적화에 대한 이야기를 나누고 싶어요.',
        category: 'community',
        user_id: 'demo-user-2',
        author_name: '개발자김씨',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        view_count: 8,
        profiles: {
          username: '개발자김씨',
          avatar_url: undefined
        },
        likes: [{ id: 'like-1' }],
        comments: [{ id: 'comment-1' }]
      },
      {
        id: 'demo-3',
        title: '신입 개발자 구직 중',
        content: '컴퓨터공학과 졸업 예정이며, React와 Spring Boot를 활용한 프로젝트 경험이 있습니다. 성장할 수 있는 환경을 찾고 있어요.',
        category: 'job_seek',
        user_id: 'demo-user-3',
        author_name: '신입개발자',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString(),
        view_count: 23,
        profiles: {
          username: '신입개발자',
          avatar_url: undefined
        },
        likes: [{ id: 'like-2' }, { id: 'like-3' }],
        comments: []
      }
    ] as PostWithDetails[]
  }

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
