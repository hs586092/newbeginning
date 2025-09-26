/**
 * ✅ Edge Comments API - 댓글 데이터 프록시
 * 클라이언트에서 Supabase 로드 없이 댓글 접근
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
    const limit = parseInt(url.searchParams.get('limit') || '50')

    if (!postId) {
      return new Response(JSON.stringify({ error: 'post_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 📊 댓글 데이터 조회 (RPC 함수 사용)
    const { data: comments, error } = await supabase
      .rpc('get_post_comments', { p_post_id: postId })

    if (error) {
      console.error('Edge comments fetch error:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch comments', comments: [] }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ✅ 댓글 수 최적화 캐싱
    return new Response(JSON.stringify({
      comments: comments?.slice(0, limit) || [],
      total_count: comments?.length || 0,
      post_id: postId
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300',
        'CDN-Cache-Control': 'public, s-maxage=60',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=120'
      }
    })

  } catch (error) {
    console.error('Edge comments API error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      comments: [],
      total_count: 0
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}