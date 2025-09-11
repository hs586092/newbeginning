'use server'

import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1, '댓글 내용을 입력해주세요').max(1000, '댓글은 1000자 이하로 입력해주세요'),
  parentCommentId: z.string().uuid().optional(),
})

export async function createComment(formData: FormData) {
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
    postId: formData.get('postId') as string,
    content: formData.get('content') as string,
    parentCommentId: formData.get('parentCommentId') as string || undefined,
  }

  try {
    const validatedData = createCommentSchema.parse(rawData)

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: validatedData.postId,
        content: validatedData.content,
        user_id: user.id,
        author_name: (profile as any)?.username || user.email || '익명',
        parent_comment_id: validatedData.parentCommentId || null
      } as any)

    if (error) {
      console.error('Comment creation error:', error)
      return { error: '댓글 작성 중 오류가 발생했습니다.', type: 'database' as const }
    }

    revalidatePath(`/post/${validatedData.postId}`)
    revalidatePath('/')
    revalidatePath('/jobs')
    revalidatePath('/community')
    
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.issues[0].message,
        type: 'validation' as const
      }
    }
    
    console.error('Unexpected error:', error)
    return { 
      error: '댓글 작성 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}

export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createServerSupabaseClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: '로그인이 필요합니다.', type: 'auth' as const }
  }

  try {
    // Check if user owns the comment
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (!existingComment || (existingComment as any).user_id !== user.id) {
      return { error: '삭제 권한이 없습니다.', type: 'permission' as const }
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Comment deletion error:', error)
      return { error: '댓글 삭제 중 오류가 발생했습니다.', type: 'database' as const }
    }

    revalidatePath(`/post/${postId}`)
    revalidatePath('/')
    revalidatePath('/jobs')
    revalidatePath('/community')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { 
      error: '댓글 삭제 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}