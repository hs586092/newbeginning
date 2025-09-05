import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { incrementViewCount } from '@/lib/posts/actions'
import { CommentForm } from '@/components/comments/comment-form'
import { CommentList } from '@/components/comments/comment-list'
import { PostCard } from '@/components/posts/post-card'
import { notFound } from 'next/navigation'
import type { PostWithDetails, CommentWithProfile } from '@/types/database.types'

async function getPost(id: string): Promise<PostWithDetails | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!user_id (
        username,
        avatar_url
      ),
      likes (id),
      comments (id)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return null
  }

  // Increment view count
  await incrementViewCount(id)

  return post
}

async function getComments(postId: string): Promise<CommentWithProfile[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles!comments_user_id_fkey (
        username,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return comments || []
}

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const [post, comments, { user }] = await Promise.all([
    getPost(id),
    getComments(id),
    getUser()
  ])

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Post Content */}
      <div className="mb-8">
        <PostCard
          post={post}
          currentUserId={user?.id}
          isOwner={user?.id === post.user_id}
        />
      </div>

      {/* Comments Section */}
      <div className="space-y-6">
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">
            댓글 {comments.length}개
          </h2>
          
          <CommentForm 
            postId={id} 
            isLoggedIn={!!user} 
          />
        </div>

        <div>
          <CommentList 
            comments={comments}
            currentUserId={user?.id}
            postId={id}
          />
        </div>
      </div>
    </div>
  )
}