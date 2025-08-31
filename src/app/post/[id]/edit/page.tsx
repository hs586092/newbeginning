import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { PostForm } from '@/components/posts/post-form'
import { notFound, redirect } from 'next/navigation'
import type { Database } from '@/types/database.types'

type Post = Database['public']['Tables']['posts']['Row']

async function getPost(id: string): Promise<Post | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return null
  }

  return post
}

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const [post, { user }] = await Promise.all([
    getPost(id),
    getUser()
  ])

  if (!post) {
    notFound()
  }

  // Check if user is the owner of the post
  if (!user || user.id !== post.user_id) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PostForm post={post} mode="edit" />
    </div>
  )
}