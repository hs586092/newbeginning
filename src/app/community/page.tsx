import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { PostList } from '@/components/posts/post-list'
import { RealtimeProvider } from '@/components/providers/realtime-provider'
import type { PostWithDetails } from '@/types/database.types'

async function getCommunityPosts(): Promise<PostWithDetails[]> {
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
      .eq('category', 'community')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Supabase connection failed (using placeholder credentials)')
      return getDemoCommunityPosts()
    }

    return posts || []
  } catch (error) {
    console.log('Database connection unavailable, showing demo community posts')
    return getDemoCommunityPosts()
  }
}

function getDemoCommunityPosts(): PostWithDetails[] {
  return [
    {
      id: 'demo-community-1',
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
        avatar_url: null
      },
      likes: [{ id: 'like-1' }],
      comments: [{ id: 'comment-1' }]
    },
    {
      id: 'demo-community-2',
      title: 'React 18의 새로운 기능들',
      content: 'Concurrent Features와 Suspense를 실제 프로젝트에 적용해본 후기입니다. 성능 개선이 확실히 체감되더라구요.',
      category: 'community',
      user_id: 'demo-user-5',
      author_name: 'React개발자',
      created_at: new Date(Date.now() - 10800000).toISOString(),
      updated_at: new Date(Date.now() - 10800000).toISOString(),
      view_count: 42,
      profiles: {
        username: 'React개발자',
        avatar_url: null
      },
      likes: [{ id: 'like-5' }, { id: 'like-6' }, { id: 'like-7' }],
      comments: [{ id: 'comment-3' }, { id: 'comment-4' }]
    },
    {
      id: 'demo-community-3',
      title: '개발자 스터디 모집',
      content: '알고리즘 문제 풀이 스터디를 시작하려고 합니다. 매주 토요일 오전 10시, 온라인으로 진행할 예정이에요. 관심 있으신 분들 연락주세요!',
      category: 'community',
      user_id: 'demo-user-6',
      author_name: '알고리즘마스터',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
      view_count: 67,
      profiles: {
        username: '알고리즘마스터',
        avatar_url: null
      },
      likes: [{ id: 'like-8' }, { id: 'like-9' }],
      comments: [{ id: 'comment-5' }, { id: 'comment-6' }, { id: 'comment-7' }]
    }
  ] as PostWithDetails[]
}

export default async function CommunityPage() {
  const [posts, { user }] = await Promise.all([
    getCommunityPosts(),
    getUser()
  ])

  return (
    <RealtimeProvider>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
          <p className="text-gray-600 mt-2">자유로운 소통과 정보 공유의 공간입니다</p>
        </div>

        <PostList 
          posts={posts} 
          currentUserId={user?.id}
          emptyMessage="커뮤니티 게시글이 없습니다. 첫 번째 커뮤니티 글을 작성해보세요!"
        />
      </div>
    </RealtimeProvider>
  )
}