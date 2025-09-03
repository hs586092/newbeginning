import { PostList } from './post-list'
import { searchPosts, getEducationalPosts } from '@/lib/posts/actions'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { PostWithDetails } from '@/types/database.types'

interface PostsWrapperProps {
  searchParams: { [key: string]: string | undefined }
  currentUserId?: string
}

// Smart feed algorithm - mix regular posts with educational content
async function getMixedFeedPosts(): Promise<PostWithDetails[]> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get regular posts (non-educational categories)
    const { data: regularPosts, error: regularError } = await supabase
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
      .in('category', ['job_offer', 'job_seek', 'community'])
      .order('created_at', { ascending: false })
      .limit(20)

    // Get educational posts with metadata
    const educationalResult = await getEducationalPosts({
      featured_only: false,
      limit: 8
    })
    
    const educationalPosts = educationalResult.posts as PostWithDetails[]
    
    if (regularError) {
      console.log('Regular posts fetch failed')
      return educationalPosts
    }
    
    // Mix posts using smart algorithm
    return mixPostsIntelligently(regularPosts || [], educationalPosts)
  } catch (error) {
    console.log('Mixed feed failed, showing demo content')
    return getDemoPosts()
  }
}

// Intelligent post mixing algorithm
function mixPostsIntelligently(regularPosts: PostWithDetails[], educationalPosts: PostWithDetails[]): PostWithDetails[] {
  if (educationalPosts.length === 0) return regularPosts
  if (regularPosts.length === 0) return educationalPosts
  
  const mixedFeed: PostWithDetails[] = []
  let regularIndex = 0
  let educationalIndex = 0
  
  // Sort educational posts by priority (featured first, then by display_priority)
  const sortedEducational = [...educationalPosts].sort((a, b) => {
    const aPriority = a.educational_metadata?.is_featured ? 1000 : (a.educational_metadata?.display_priority || 0)
    const bPriority = b.educational_metadata?.is_featured ? 1000 : (b.educational_metadata?.display_priority || 0)
    return bPriority - aPriority
  })
  
  let postsAddedSinceLastEducational = 0
  const insertInterval = 3 + Math.floor(Math.random() * 3) // Random between 3-5 posts
  
  while (regularIndex < regularPosts.length || educationalIndex < sortedEducational.length) {
    // Add educational content if it's time and we have educational posts available
    if (educationalIndex < sortedEducational.length && 
        (postsAddedSinceLastEducational >= insertInterval || regularIndex >= regularPosts.length)) {
      mixedFeed.push(sortedEducational[educationalIndex])
      educationalIndex++
      postsAddedSinceLastEducational = 0
      continue
    }
    
    // Add regular post
    if (regularIndex < regularPosts.length) {
      mixedFeed.push(regularPosts[regularIndex])
      regularIndex++
      postsAddedSinceLastEducational++
    }
  }
  
  return mixedFeed
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

  // Use smart mixed feed for default view
  return getMixedFeedPosts()
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