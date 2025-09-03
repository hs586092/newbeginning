'use server'

import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'

export interface UserStats {
  totalPosts: number
  totalLikes: number
  totalComments: number
  joinedDaysAgo: number
}

export async function getUserStats(): Promise<UserStats | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { user } = await getUser()
    
    if (!user) {
      return null
    }

    // 간단한 통계만 가져오기 (복잡한 쿼리 피함)
    const [postsResult, commentsResult] = await Promise.all([
      // 내가 작성한 글 수
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      
      // 내가 작성한 댓글 수
      supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
    ])

    // 가입일 계산 (기본값 사용)
    const joinedDate = new Date(user.created_at)
    const today = new Date()
    const joinedDaysAgo = Math.floor((today.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24))

    return {
      totalPosts: postsResult.count || 0,
      totalLikes: 0, // 일단 0으로 설정 (나중에 개선)
      totalComments: commentsResult.count || 0,
      joinedDaysAgo: Math.max(0, joinedDaysAgo) // 음수 방지
    }

  } catch (error) {
    console.error('사용자 통계 조회 실패:', error)
    return {
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      joinedDaysAgo: 0
    }
  }
}