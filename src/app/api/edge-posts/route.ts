/**
 * ✅ Edge Function: 게시글 데이터 프록시
 * 클라이언트에서 Supabase 로드 없이 데이터 접근
 */

export const runtime = 'edge'

// Supabase imports only on Edge (not in client bundle)
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export async function GET(request: Request) {
  try {
    // Edge에서만 Supabase 연결 (클라이언트 번들 영향 없음)
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // 📊 빠른 데이터 조회 (간소화된 쿼리)
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        author_id,
        profiles!inner(
          id,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Edge posts fetch error:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ✅ 강력한 캐싱으로 성능 최적화
    return new Response(JSON.stringify({ posts, count: posts?.length || 0 }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
        'CDN-Cache-Control': 'public, s-maxage=60',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=300'
      }
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}