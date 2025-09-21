'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export interface BookmarkActionResult {
  success: boolean
  isBookmarked?: boolean
  error?: string
}

/**
 * 게시글 북마크 토글
 */
export async function toggleBookmark(postId: string): Promise<BookmarkActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 현재 북마크 상태 확인
    const { data: existingBookmark, error: checkError } = await supabase
      .from('post_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle()

    if (checkError) {
      console.error('Bookmark check error:', checkError)
      return { success: false, error: '북마크 상태 확인 중 오류가 발생했습니다.' }
    }

    let isBookmarked: boolean

    if (existingBookmark) {
      // 북마크 제거
      const { error: deleteError } = await supabase
        .from('post_bookmarks')
        .delete()
        .eq('id', existingBookmark.id)

      if (deleteError) {
        console.error('Bookmark delete error:', deleteError)
        return { success: false, error: '북마크 제거 중 오류가 발생했습니다.' }
      }

      isBookmarked = false
    } else {
      // 북마크 추가
      const { error: insertError } = await supabase
        .from('post_bookmarks')
        .insert({
          user_id: user.id,
          post_id: postId
        })

      if (insertError) {
        console.error('Bookmark insert error:', insertError)
        return { success: false, error: '북마크 추가 중 오류가 발생했습니다.' }
      }

      isBookmarked = true
    }

    // 캐시 무효화
    revalidatePath('/bookmarks')
    revalidatePath(`/post/${postId}`)

    return { success: true, isBookmarked }

  } catch (error) {
    console.error('Toggle bookmark error:', error)
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' }
  }
}

/**
 * 사용자의 북마크된 게시글 목록 조회
 */
export async function getUserBookmarks(page = 1, limit = 20) {
  try {
    const supabase = await createServerSupabaseClient()

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.', data: null }
    }

    const offset = (page - 1) * limit

    // 북마크된 게시글 조회 (관련 게시글 정보 포함)
    const { data: bookmarks, error, count } = await supabase
      .from('post_bookmarks')
      .select(`
        id,
        created_at,
        posts (
          id,
          content,
          created_at,
          updated_at,
          category_id,
          baby_month,
          images,
          is_question,
          tags,
          mood,
          profiles (
            id,
            username,
            avatar_url,
            baby_birth_date,
            baby_name,
            is_pregnant,
            pregnancy_week
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Get bookmarks error:', error)
      return { success: false, error: '북마크 목록 조회 중 오류가 발생했습니다.', data: null }
    }

    return {
      success: true,
      data: {
        bookmarks: bookmarks || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          hasMore: count ? count > offset + limit : false
        }
      }
    }

  } catch (error) {
    console.error('Get user bookmarks error:', error)
    return { success: false, error: '예상치 못한 오류가 발생했습니다.', data: null }
  }
}

/**
 * 특정 게시글의 북마크 상태 확인
 */
export async function getBookmarkStatus(postId: string): Promise<{ isBookmarked: boolean }> {
  try {
    const supabase = await createServerSupabaseClient()

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { isBookmarked: false }
    }

    const { data: bookmark, error } = await supabase
      .from('post_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle()

    if (error) {
      console.error('Get bookmark status error:', error)
      return { isBookmarked: false }
    }

    return { isBookmarked: !!bookmark }

  } catch (error) {
    console.error('Get bookmark status error:', error)
    return { isBookmarked: false }
  }
}

/**
 * 북마크 개수 조회
 */
export async function getBookmarkCount(): Promise<{ count: number }> {
  try {
    const supabase = await createServerSupabaseClient()

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { count: 0 }
    }

    const { count, error } = await supabase
      .from('post_bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (error) {
      console.error('Get bookmark count error:', error)
      return { count: 0 }
    }

    return { count: count || 0 }

  } catch (error) {
    console.error('Get bookmark count error:', error)
    return { count: 0 }
  }
}