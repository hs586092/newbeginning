import { getEducationalPosts, searchPosts } from '@/lib/posts/actions'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { PostWithDetails } from '@/types/database.types'
import { PostList } from './post-list'

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
      .select('*')
      .in('category', ['community', 'expecting', 'newborn', 'toddler', 'expert'])
      .order('created_at', { ascending: false })
      .limit(20)

    // Get educational posts with metadata
    const educationalResult = await getEducationalPosts({
      featured_only: false,
      limit: 8
    })

    const educationalPosts = educationalResult.posts as PostWithDetails[]

    if (regularError) {
      console.log('Regular posts fetch failed:', regularError)
      // If no regular posts, try to get any posts at all
      const { data: anyPosts, error: anyError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (anyError) {
        console.log('Any posts fetch also failed:', anyError)
        return educationalPosts.length > 0 ? educationalPosts : getDemoPosts()
      }

      return mixPostsIntelligently(anyPosts || [], educationalPosts)
    }

    // If no regular posts found, show demo content
    if (!regularPosts || regularPosts.length === 0) {
      console.log('No regular posts found, showing demo content')
      return getDemoPosts()
    }

    // Mix posts using smart algorithm
    return mixPostsIntelligently(regularPosts, educationalPosts)
  } catch (error) {
    console.log('Mixed feed failed, showing demo content:', error)
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
  const { q: query, category, sort } = searchParams

  // 검색 파라미터가 있으면 검색 API 사용
  if (query || category || sort) {
    try {
      const result = await searchPosts(query || '', category, sort)
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
      id: '6d3a1589-197f-4802-b9c4-0a7e9be92c9d',
      title: '임신 초기 입덧 극복법',
      content: '임신 6주부터 시작된 입덧으로 고생하고 있어요. 생강차와 비타민 B6가 도움이 된다고 하네요. 다른 예비맘들은 어떻게 극복하셨나요?',
      category: 'expecting',
      user_id: 'demo-user-1',
      author_name: '예비맘7주',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      view_count: 15,
      profiles: {
        username: '예비맘7주',
        avatar_url: undefined
      },
      likes: [],
      comments: []
    },
    {
      id: '8b473e1b-78d3-474c-91ec-6f3653f83c8e',
      title: '신생아 수유 간격 궁금해요',
      content: '생후 2주된 아기인데 수유 간격이 1-2시간이에요. 이게 정상인지 궁금합니다. 언제쯤 간격이 길어질까요?',
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
      title: '이유식 시작 시기와 준비물',
      content: '아기가 5개월이 되어서 이유식 준비 중이에요. 언제부터 시작하는 게 좋을까요? 필요한 준비물도 알려주세요!',
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
