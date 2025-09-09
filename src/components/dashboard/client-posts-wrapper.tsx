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

        // Build query based on search parameters - use simpler query first
        let query = supabase
          .from('posts')
          .select('*')

        // Apply search filters
        const { q: searchQuery, category, location } = searchParams

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        }

        if (category && category !== 'all') {
          query = query.eq('category', category)
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
        id: '6d3a1589-197f-4802-b9c4-0a7e9be92c9d',
        title: '임신 초기 증상과 대처법',
        content: '임신 6주차인데 입덧이 심해서 고생하고 있어요. 어떻게 하면 좀 나아질까요? 경험 있으신 분들 조언 부탁드려요.',
        category: 'expecting',
        user_id: 'demo-user-1',
        author_name: '예비맘6주',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 15,
        profiles: {
          username: '예비맘6주',
          avatar_url: undefined
        },
        likes: [],
        comments: []
      },
      {
        id: '8b473e1b-78d3-474c-91ec-6f3653f83c8e',
        title: '신생아 수유량 궁금해요',
        content: '생후 1주된 아기인데 수유량이 충분한지 걱정됩니다. 하루에 몇 번 정도 수유하는 게 정상인가요?',
        category: 'newborn',
        user_id: 'demo-user-2',
        author_name: '새내기엄마',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        view_count: 8,
        profiles: {
          username: '새내기엄마',
          avatar_url: undefined
        },
        likes: [{ id: 'like-1' }],
        comments: [{ id: 'comment-1' }]
      },
      {
        id: '696fd831-74e7-422a-81d9-04ce22c43ecb',
        title: '아기 이유식 시작 시기',
        content: '5개월 된 아기 이유식을 언제부터 시작해야 할까요? 첫 이유식으로 뭐가 좋을까요?',
        category: 'toddler',
        user_id: 'demo-user-3',
        author_name: '육아맘5개월',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString(),
        view_count: 23,
        profiles: {
          username: '육아맘5개월',
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
