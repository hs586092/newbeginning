import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { PostList } from '@/components/posts/post-list'
import { RealtimeProvider } from '@/components/providers/realtime-provider'
import type { PostWithDetails } from '@/types/database.types'

async function getJobPosts(): Promise<PostWithDetails[]> {
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
      .in('category', ['job_offer', 'job_seek'])
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Supabase connection failed (using placeholder credentials)')
      return getDemoJobPosts()
    }

    return posts || []
  } catch (error) {
    console.log('Database connection unavailable, showing demo job posts')
    return getDemoJobPosts()
  }
}

function getDemoJobPosts(): PostWithDetails[] {
  return [
    {
      id: 'demo-job-1',
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
        avatar_url: null
      },
      likes: [],
      comments: []
    },
    {
      id: 'demo-job-2',
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
        avatar_url: null
      },
      likes: [{ id: 'like-2' }, { id: 'like-3' }],
      comments: []
    },
    {
      id: 'demo-job-3',
      title: 'Python 백엔드 개발자 모집',
      content: 'Django/FastAPI 경험자를 찾습니다. 핀테크 스타트업에서 함께 성장할 개발자를 기다립니다.',
      category: 'job_offer',
      company: '핀테크컴퍼니',
      location: '서울 서초구',
      salary: '5000-8000만원',
      contact: 'jobs@fintech.com',
      deadline: '2024-10-15',
      user_id: 'demo-user-4',
      author_name: 'CTO',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      view_count: 31,
      profiles: {
        username: 'CTO',
        avatar_url: null
      },
      likes: [{ id: 'like-4' }],
      comments: [{ id: 'comment-2' }]
    }
  ] as PostWithDetails[]
}

export default async function JobsPage() {
  const [posts, { user }] = await Promise.all([
    getJobPosts(),
    getUser()
  ])

  return (
    <RealtimeProvider>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">구인구직</h1>
          <p className="text-gray-600 mt-2">새로운 기회를 찾거나 인재를 구해보세요</p>
        </div>

        <PostList 
          posts={posts} 
          currentUserId={user?.id}
          emptyMessage="구인구직 게시글이 없습니다. 첫 번째 구인/구직 글을 작성해보세요!"
        />
      </div>
    </RealtimeProvider>
  )
}