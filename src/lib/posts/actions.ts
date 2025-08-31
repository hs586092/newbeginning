'use server'

import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const createPostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이하로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  category: z.enum(['job_offer', 'job_seek', 'community']),
  // Job-specific fields
  company: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  contact: z.string().optional(),
  deadline: z.string().optional(),
})

const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().uuid(),
})

export async function createPost(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: '로그인이 필요합니다.', type: 'auth' as const }
  }

  // Get user profile for author_name
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const rawData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    category: formData.get('category') as string,
    company: formData.get('company') as string || undefined,
    location: formData.get('location') as string || undefined,
    salary: formData.get('salary') as string || undefined,
    contact: formData.get('contact') as string || undefined,
    deadline: formData.get('deadline') as string || undefined,
  }

  try {
    const validatedData = createPostSchema.parse(rawData)

    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...validatedData,
        user_id: user.id,
        author_name: (profile as any)?.username || user.email || '익명'
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Post creation error:', error)
      return { error: '게시글 작성 중 오류가 발생했습니다.', type: 'database' as const }
    }

    revalidatePath('/')
    revalidatePath('/jobs')
    revalidatePath('/community')
    
    redirect(`/post/${(data as any).id}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.issues[0].message,
        type: 'validation' as const
      }
    }
    
    console.error('Unexpected error:', error)
    return { 
      error: '게시글 작성 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}

export async function updatePost(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: '로그인이 필요합니다.', type: 'auth' as const }
  }

  const rawData = {
    id: formData.get('id') as string,
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    category: formData.get('category') as string,
    company: formData.get('company') as string || undefined,
    location: formData.get('location') as string || undefined,
    salary: formData.get('salary') as string || undefined,
    contact: formData.get('contact') as string || undefined,
    deadline: formData.get('deadline') as string || undefined,
  }

  try {
    const validatedData = updatePostSchema.parse(rawData)
    
    // Check if user owns the post
    const { data: existingPost } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', validatedData.id)
      .single()

    if (!existingPost || (existingPost as any).user_id !== user.id) {
      return { error: '수정 권한이 없습니다.', type: 'permission' as const }
    }

    const { id, ...updateData } = validatedData
    const { error } = await (supabase as any)
      .from('posts')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Post update error:', error)
      return { error: '게시글 수정 중 오류가 발생했습니다.', type: 'database' as const }
    }

    revalidatePath('/')
    revalidatePath('/jobs')
    revalidatePath('/community')
    revalidatePath(`/post/${id}`)
    
    redirect(`/post/${id}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.issues[0].message,
        type: 'validation' as const
      }
    }
    
    console.error('Unexpected error:', error)
    return { 
      error: '게시글 수정 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}

export async function deletePost(postId: string) {
  const supabase = await createServerSupabaseClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: '로그인이 필요합니다.', type: 'auth' as const }
  }

  try {
    // Check if user owns the post
    const { data: existingPost } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (!existingPost || (existingPost as any).user_id !== user.id) {
      return { error: '삭제 권한이 없습니다.', type: 'permission' as const }
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('Post deletion error:', error)
      return { error: '게시글 삭제 중 오류가 발생했습니다.', type: 'database' as const }
    }

    revalidatePath('/')
    revalidatePath('/jobs')
    revalidatePath('/community')
    revalidatePath('/my-posts')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { 
      error: '게시글 삭제 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}

export async function incrementViewCount(postId: string) {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { error } = await (supabase as any)
      .rpc('increment_view_count', { post_id: postId })

    if (error) {
      console.error('View count increment error:', error)
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

export async function toggleLike(postId: string) {
  const supabase = await createServerSupabaseClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: '로그인이 필요합니다.', type: 'auth' as const }
  }

  try {
    // Check if like exists
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (error) {
        return { error: '좋아요 취소 중 오류가 발생했습니다.', type: 'database' as const }
      }

      revalidatePath('/')
      revalidatePath('/jobs')
      revalidatePath('/community')
      revalidatePath(`/post/${postId}`)
      
      return { liked: false }
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: user.id
        } as any)

      if (error) {
        return { error: '좋아요 중 오류가 발생했습니다.', type: 'database' as const }
      }

      revalidatePath('/')
      revalidatePath('/jobs')
      revalidatePath('/community')
      revalidatePath(`/post/${postId}`)
      
      return { liked: true }
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { 
      error: '좋아요 처리 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}