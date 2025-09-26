/**
 * ✅ Edge Likes API - 좋아요 데이터 프록시
 * 클라이언트에서 Supabase 로드 없이 좋아요 접근
 */

export const runtime = 'edge'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export async function GET(request: Request) {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const url = new URL(request.url)
    const postId = url.searchParams.get('post_id')
    const userId = url.searchParams.get('user_id')

    if (!postId) {
      return new Response(JSON.stringify({ error: 'post_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 📊 좋아요 수 조회 (RPC 함수 사용)
    const { data: likesCount, error: countError } = await supabase
      .rpc('get_post_like_count', { p_post_id: postId })

    if (countError) {
      console.error('Edge likes count error:', countError)
      return new Response(JSON.stringify({ error: 'Failed to fetch likes count' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let isLiked = false

    // 사용자별 좋아요 여부 확인
    if (userId) {
      const { data: userLike, error: likeError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle()

      if (!likeError && userLike) {
        isLiked = true
      }
    }

    // 좋아요 목록 조회 (최대 50개)
    const { data: likes, error: likesError } = await supabase
      .from('post_likes')
      .select(`
        id,
        user_id,
        created_at,
        profiles!post_likes_user_id_fkey (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(50)

    const likesData = likes || []

    // ✅ 좋아요 데이터 최적화 응답
    return new Response(JSON.stringify({
      post_id: postId,
      likes_count: typeof likesCount === 'number' ? likesCount : 0,
      is_liked: isLiked,
      likes: likesData,
      user_id: userId || null
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
        'CDN-Cache-Control': 'public, s-maxage=30',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=60'
      }
    })

  } catch (error) {
    console.error('Edge likes API error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      post_id: postId,
      likes_count: 0,
      is_liked: false,
      likes: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}