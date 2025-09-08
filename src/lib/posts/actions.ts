'use server'

import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { RedirectType } from 'next/navigation'
import { z } from 'zod'

const createPostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이하로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  category: z.enum(['community', 'expecting', 'newborn', 'toddler', 'expert']),
  is_question: z.boolean().optional(),
  baby_month: z.number().min(0).max(24).optional(),
  tags: z.array(z.string()).optional(),
  mood: z.string().optional(),
})

const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().uuid(),
})

// Educational content specific schemas
const createEducationalPostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이하로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  category: z.enum(['expecting', 'newborn', 'toddler', 'expert']),
  // Educational metadata
  display_priority: z.number().min(0).max(100).default(0),
  target_audience: z.enum(['expecting_parents', 'new_parents', 'toddler_parents', 'all_parents']),
  content_type: z.enum(['article', 'infographic', 'checklist', 'guide', 'tips']),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  estimated_read_time: z.number().min(1).max(60).default(5),
  keywords: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  expert_verified: z.boolean().default(false),
})

const updateEducationalPostSchema = createEducationalPostSchema.partial().extend({
  id: z.string().uuid(),
})

export async function createPost(formData: FormData) {
  console.log('createPost called')
  
  const supabase = await createServerSupabaseClient()
  const { user } = await getUser()
  
  console.log('User from getUser:', user ? { id: user.id, email: user.email } : 'null')
  
  if (!user) {
    console.log('No user found, returning auth error')
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
    is_question: formData.get('is_question') === 'true',
    baby_month: formData.get('baby_month') ? parseInt(formData.get('baby_month') as string) : undefined,
    tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : undefined,
    mood: formData.get('mood') as string || undefined,
  }

  console.log('Raw form data:', rawData)

  try {
    const validatedData = createPostSchema.parse(rawData)
    console.log('Validated data:', validatedData)

    // Create basic post data first
    const postData = {
      title: validatedData.title,
      content: validatedData.content,
      category: validatedData.category,
      user_id: user.id,
      author_name: (profile as any)?.username || user.email || '익명'
    }
    
    // Add optional fields only if they exist
    if (validatedData.is_question !== undefined) {
      (postData as any).is_question = validatedData.is_question
    }
    if (validatedData.baby_month !== undefined) {
      (postData as any).baby_month = validatedData.baby_month
    }
    if (validatedData.tags && validatedData.tags.length > 0) {
      (postData as any).tags = validatedData.tags
    }
    if (validatedData.mood) {
      (postData as any).mood = validatedData.mood
    }

    console.log('Final post data to insert:', postData)

    const { data, error } = await supabase
      .from('posts')
      .insert(postData as any)
      .select()
      .single()

    console.log('Supabase insert result:', { data, error })

    if (error) {
      console.error('Post creation error:', error)
      return { error: `게시글 작성 중 오류가 발생했습니다: ${error.message}`, type: 'database' as const }
    }

    revalidatePath('/')
    revalidatePath('/community')
    
    redirect('/', RedirectType.replace)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.issues[0].message,
        type: 'validation' as const
      }
    }
    
    // Next.js redirect는 예외를 던지므로 다시 던져야 함
    if (error && typeof error === 'object' && 'digest' in error && (error as any).digest?.includes('NEXT_REDIRECT')) {
      throw error
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
    is_question: formData.get('is_question') === 'true',
    baby_month: formData.get('baby_month') ? parseInt(formData.get('baby_month') as string) : undefined,
    tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : undefined,
    mood: formData.get('mood') as string || undefined,
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

export async function searchPosts(query: string = '', category?: string, sort: string = 'latest') {
  const supabase = await createServerSupabaseClient()
  
  try {
    let queryBuilder = supabase
      .from('posts')
      .select('*')

    // 텍스트 검색 (제목 + 내용)
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    }

    // 카테고리 필터
    if (category && category !== 'all') {
      queryBuilder = queryBuilder.eq('category', category)
    }

    // 정렬 로직
    switch (sort) {
      case 'popular':
        // 인기글: view_count + likes 수 조합으로 정렬
        queryBuilder = queryBuilder.order('view_count', { ascending: false })
        break
      case 'comments':
        // 댓글 많은 글은 클라이언트 사이드에서 정렬 (Supabase의 한계)
        queryBuilder = queryBuilder.order('created_at', { ascending: false })
        break
      case 'expert':
        // 전문가 글: expert_verified 우선, 그 다음 created_at
        queryBuilder = queryBuilder.order('created_at', { ascending: false })
        break
      case 'latest':
      default:
        queryBuilder = queryBuilder.order('created_at', { ascending: false })
        break
    }

    const { data: posts, error } = await queryBuilder
      .limit(50) // 성능을 위해 제한

    if (error) {
      console.error('Search error:', error)
      return { error: '검색 중 오류가 발생했습니다.', posts: [] }
    }

    let sortedPosts = posts || []

    // 클라이언트 사이드 정렬 (Supabase로 처리하기 어려운 것들)
    if (sort === 'comments') {
      // 댓글 수로 정렬
      sortedPosts = sortedPosts.sort((a, b) => (b as any).comments?.length - (a as any).comments?.length)
    } else if (sort === 'expert') {
      // 전문가 검증 글 우선, 그 다음 created_at
      sortedPosts = sortedPosts.sort((a, b) => {
        const aIsExpert = (a as any).educational_metadata?.expert_verified || false
        const bIsExpert = (b as any).educational_metadata?.expert_verified || false
        
        if (aIsExpert && !bIsExpert) return -1
        if (!aIsExpert && bIsExpert) return 1
        
        // 둘 다 전문가 글이거나 둘 다 일반글이면 최신 순
        return new Date((b as any).created_at).getTime() - new Date((a as any).created_at).getTime()
      })
    } else if (sort === 'popular') {
      // 인기도 = view_count * 0.7 + likes_count * 0.3
      sortedPosts = sortedPosts.sort((a, b) => {
        const aScore = ((a as any).view_count || 0) * 0.7 + ((a as any).likes?.length || 0) * 0.3
        const bScore = ((b as any).view_count || 0) * 0.7 + ((b as any).likes?.length || 0) * 0.3
        return bScore - aScore
      })
    }

    return { posts: sortedPosts }
  } catch (error) {
    console.error('Unexpected search error:', error)
    return { error: '검색 중 오류가 발생했습니다.', posts: [] }
  }
}

export async function toggleLike(postId: string) {
  const supabase = await createServerSupabaseClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: '로그인이 필요합니다.', type: 'auth' as const }
  }

  try {
    // Check if like exists (using post_hugs table based on schema)
    const { data: existingLike } = await supabase
      .from('post_hugs')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('post_hugs')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (error) {
        return { error: '포근함 취소 중 오류가 발생했습니다.', type: 'database' as const }
      }

      revalidatePath('/')
      revalidatePath('/community')
      revalidatePath(`/post/${postId}`)
      
      return { liked: false }
    } else {
      // Like
      const { error } = await supabase
        .from('post_hugs')
        .insert({
          post_id: postId,
          user_id: user.id
        } as any)

      if (error) {
        return { error: '포근함 전달 중 오류가 발생했습니다.', type: 'database' as const }
      }

      revalidatePath('/')
      revalidatePath('/community')
      revalidatePath(`/post/${postId}`)
      
      return { liked: true }
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { 
      error: '포근함 처리 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}

export async function toggleBookmark(postId: string) {
  const supabase = await createServerSupabaseClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: '로그인이 필요합니다.', type: 'auth' as const }
  }

  try {
    // Check if bookmark exists
    const { data: existingBookmark } = await supabase
      .from('post_bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingBookmark) {
      // Remove bookmark
      const { error } = await supabase
        .from('post_bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (error) {
        return { error: '북마크 해제 중 오류가 발생했습니다.', type: 'database' as const }
      }

      revalidatePath('/')
      revalidatePath('/community')
      revalidatePath(`/post/${postId}`)
      
      return { bookmarked: false }
    } else {
      // Add bookmark
      const { error } = await supabase
        .from('post_bookmarks')
        .insert({
          post_id: postId,
          user_id: user.id
        } as any)

      if (error) {
        return { error: '북마크 추가 중 오류가 발생했습니다.', type: 'database' as const }
      }

      revalidatePath('/')
      revalidatePath('/community')
      revalidatePath(`/post/${postId}`)
      
      return { bookmarked: true }
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { 
      error: '북마크 처리 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}

// Educational content management functions
export async function createEducationalPost(formData: FormData) {
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
    display_priority: parseInt(formData.get('display_priority') as string) || 0,
    target_audience: formData.get('target_audience') as string,
    content_type: formData.get('content_type') as string,
    difficulty_level: formData.get('difficulty_level') as string || 'beginner',
    estimated_read_time: parseInt(formData.get('estimated_read_time') as string) || 5,
    keywords: formData.get('keywords') ? JSON.parse(formData.get('keywords') as string) : [],
    is_featured: formData.get('is_featured') === 'true',
    expert_verified: formData.get('expert_verified') === 'true',
  }

  try {
    const validatedData = createEducationalPostSchema.parse(rawData)
    
    // Extract post data and metadata
    const postData = {
      title: validatedData.title,
      content: validatedData.content,
      category: validatedData.category,
      user_id: user.id,
      author_name: (profile as any)?.username || user.email || '전문가'
    }

    const metadataOnly = {
      display_priority: validatedData.display_priority,
      target_audience: validatedData.target_audience,
      content_type: validatedData.content_type,
      difficulty_level: validatedData.difficulty_level,
      estimated_read_time: validatedData.estimated_read_time,
      keywords: validatedData.keywords,
      is_featured: validatedData.is_featured,
      expert_verified: validatedData.expert_verified,
    }

    // Create post first
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert(postData as any)
      .select()
      .single()

    if (postError) {
      console.error('Educational post creation error:', postError)
      return { error: '정보 컨텐츠 작성 중 오류가 발생했습니다.', type: 'database' as const }
    }

    // Create educational metadata
    const { error: metadataError } = await supabase
      .from('educational_metadata')
      .insert({
        ...metadataOnly,
        post_id: (post as any).id,
      } as any)

    if (metadataError) {
      console.error('Educational metadata creation error:', metadataError)
      // Rollback: delete the post if metadata creation fails
      await supabase.from('posts').delete().eq('id', (post as any).id)
      return { error: '정보 컨텐츠 메타데이터 생성 중 오류가 발생했습니다.', type: 'database' as const }
    }

    revalidatePath('/')
    revalidatePath('/educational')
    
    redirect(`/post/${(post as any).id}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.issues[0].message,
        type: 'validation' as const
      }
    }
    
    console.error('Unexpected error:', error)
    return { 
      error: '정보 컨텐츠 작성 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}

export async function updateEducationalPost(formData: FormData) {
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
    display_priority: parseInt(formData.get('display_priority') as string) || 0,
    target_audience: formData.get('target_audience') as string,
    content_type: formData.get('content_type') as string,
    difficulty_level: formData.get('difficulty_level') as string || 'beginner',
    estimated_read_time: parseInt(formData.get('estimated_read_time') as string) || 5,
    keywords: formData.get('keywords') ? JSON.parse(formData.get('keywords') as string) : [],
    is_featured: formData.get('is_featured') === 'true',
    expert_verified: formData.get('expert_verified') === 'true',
  }

  try {
    const validatedData = updateEducationalPostSchema.parse(rawData)
    
    // Check if user owns the post or is admin
    const { data: existingPost } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', validatedData.id)
      .single()

    if (!existingPost || (existingPost as any).user_id !== user.id) {
      return { error: '수정 권한이 없습니다.', type: 'permission' as const }
    }

    const { id, ...updateData } = validatedData
    
    // Separate post data and metadata
    const postUpdateData = {
      title: updateData.title,
      content: updateData.content,
      category: updateData.category,
      updated_at: new Date().toISOString()
    }

    const metadataUpdateData = {
      display_priority: updateData.display_priority,
      target_audience: updateData.target_audience,
      content_type: updateData.content_type,
      difficulty_level: updateData.difficulty_level,
      estimated_read_time: updateData.estimated_read_time,
      keywords: updateData.keywords,
      is_featured: updateData.is_featured,
      expert_verified: updateData.expert_verified,
      updated_at: new Date().toISOString()
    }

    // Update post
    const { error: postError } = await (supabase as any)
      .from('posts')
      .update(postUpdateData)
      .eq('id', id)

    if (postError) {
      console.error('Educational post update error:', postError)
      return { error: '정보 컨텐츠 수정 중 오류가 발생했습니다.', type: 'database' as const }
    }

    // Update metadata (upsert in case it doesn't exist)
    const { error: metadataError } = await supabase
      .from('educational_metadata')
      .upsert({
        ...metadataUpdateData,
        post_id: id,
      } as any)

    if (metadataError) {
      console.error('Educational metadata update error:', metadataError)
      return { error: '정보 컨텐츠 메타데이터 수정 중 오류가 발생했습니다.', type: 'database' as const }
    }

    revalidatePath('/')
    revalidatePath('/educational')
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
      error: '정보 컨텐츠 수정 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}

// 댓글 작성
export async function createComment(postId: string, content: string) {
  const supabase = await createServerSupabaseClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: '로그인이 필요합니다.', type: 'auth' as const }
  }

  if (!content.trim()) {
    return { error: '댓글 내용을 입력해주세요.', type: 'validation' as const }
  }

  try {
    // Get user profile for author_name
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    const { data, error } = await (supabase as any)
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        author_name: (profile as any)?.username || user.email || '익명'
      })
      .select()
      .single()

    if (error) {
      console.error('Comment creation error:', error)
      return { error: '댓글 작성 중 오류가 발생했습니다.', type: 'database' as const }
    }

    revalidatePath('/')
    revalidatePath('/community')
    revalidatePath(`/post/${postId}`)
    
    return { success: true, comment: data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { 
      error: '댓글 작성 중 오류가 발생했습니다.',
      type: 'unknown' as const
    }
  }
}

// 댓글 목록 조회
export async function getComments(postId: string) {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data, error } = await (supabase as any)
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Comments fetch error:', error)
      return { error: '댓글을 불러올 수 없습니다.', comments: [] }
    }

    return { success: true, comments: data || [] }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: '댓글을 불러올 수 없습니다.', comments: [] }
  }
}

export async function getEducationalPosts(filters?: {
  category?: string
  target_audience?: string
  featured_only?: boolean
  limit?: number
}) {
  const supabase = await createServerSupabaseClient()
  
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .in('category', ['pregnancy_info', 'parenting_guide', 'health_tips', 'nutrition_guide', 'development_info', 'safety_tips'])

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.featured_only) {
      query = query.eq('educational_metadata.is_featured', true)
    }

    if (filters?.target_audience) {
      query = query.eq('educational_metadata.target_audience', filters.target_audience)
    }

    const { data: posts, error } = await query
      .order('educational_metadata.display_priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(filters?.limit || 50)

    if (error) {
      console.error('Educational posts fetch error:', error)
      return { error: '정보 컨텐츠를 가져오는 중 오류가 발생했습니다.', posts: [] }
    }

    return { posts: posts || [] }
  } catch (error) {
    console.error('Unexpected educational posts fetch error:', error)
    return { error: '정보 컨텐츠를 가져오는 중 오류가 발생했습니다.', posts: [] }
  }
}