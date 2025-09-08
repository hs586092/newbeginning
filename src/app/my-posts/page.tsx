import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { PostList } from '@/components/posts/post-list'
import { redirect } from 'next/navigation'
import type { PostWithDetails } from '@/types/database.types'

async function getMyPosts(userId: string): Promise<PostWithDetails[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching my posts:', error)
    return []
  }

  return posts || []
}

export default async function MyPostsPage() {
  const { user } = await getUser()

  if (!user) {
    redirect('/login')
  }

  const posts = await getMyPosts(user.id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">내 게시글</h1>
        <p className="text-gray-600 mt-2">작성한 게시글을 관리할 수 있습니다</p>
      </div>

      <PostList 
        posts={posts} 
        currentUserId={user.id}
        emptyMessage="작성한 게시글이 없습니다. 새로운 글을 작성해보세요!"
      />
    </div>
  )
}