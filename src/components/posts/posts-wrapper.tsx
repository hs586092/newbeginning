import { PostList } from './post-list'
import { searchPosts } from '@/lib/posts/actions'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { PostWithDetails } from '@/types/database.types'

interface PostsWrapperProps {
  searchParams: { [key: string]: string | undefined }
  currentUserId?: string
}

async function getPosts(searchParams: { [key: string]: string | undefined }): Promise<PostWithDetails[]> {
  const { q: query, category, location } = searchParams

  // 검색 파라미터가 있으면 검색 API 사용
  if (query || category || location) {
    try {
      const result = await searchPosts(query || '', category, location)
      return result.posts as PostWithDetails[]
    } catch (error) {
      console.log('Search failed, showing demo content')
      return getDemoPosts()
    }
  }

  // 기본 게시글 로딩
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey (
          username,
          avatar_url
        ),
        likes (id),
        comments (id)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Supabase connection failed (using placeholder credentials)')
      return getDemoPosts()
    }

    return posts || []
  } catch (error) {
    console.log('Database connection unavailable, showing demo content')
    return getDemoPosts()
  }
}

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
      deadline: '2024-09-30',
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

export async function PostsWrapper({ searchParams, currentUserId }: PostsWrapperProps) {
  const posts = await getPosts(searchParams)
  const hasSearchParams = Object.keys(searchParams).length > 0

  return (
    <PostList 
      posts={posts} 
      currentUserId={currentUserId}
      emptyMessage={
        hasSearchParams 
          ? "검색 조건에 맞는 게시글이 없습니다. 다른 검색어나 필터를 시도해보세요."
          : "아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!"
      }
    />
  )
}