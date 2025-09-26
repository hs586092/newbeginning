/**
 * ✅ Static Posts API - ISR (Incremental Static Regeneration) 최적화
 * 자주 접근되지만 드물게 변경되는 데이터 최적화
 */

export const runtime = 'edge'
export const revalidate = 300 // 5분마다 재생성

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const CACHE_CONTROL = {
  // 클라이언트: 1분 캐시, 서버: 5분 캐시, 백그라운드 갱신: 59분
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3540',
    'CDN-Cache-Control': 'public, s-maxage=600',
    'Vercel-CDN-Cache-Control': 'public, s-maxage=1800'
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'featured'
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let query = supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        category,
        created_at,
        author_id,
        profiles!inner(
          id,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    // 정적 생성 최적화: 자주 요청되는 데이터 타입
    if (type === 'featured') {
      query = query.in('category', ['expert', 'educational'])
    } else if (type === 'popular') {
      // 인기 게시글 (간단한 로직 - 최근 3일간 게시글)
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      query = query.gte('created_at', threeDaysAgo.toISOString())
    } else if (type === 'community') {
      query = query.in('category', ['community', 'expecting', 'newborn', 'toddler'])
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Static posts fetch error:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch posts', posts: [] }), {
        status: 500,
        headers: CACHE_CONTROL.headers
      })
    }

    // 성공 응답 with 강력한 캐싱
    return new Response(JSON.stringify({
      posts: posts || [],
      count: posts?.length || 0,
      type,
      cached_at: new Date().toISOString(),
      revalidate_in: 300 // 5분
    }), {
      headers: CACHE_CONTROL.headers
    })

  } catch (error) {
    console.error('Static posts API error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      posts: [],
      type: 'error'
    }), {
      status: 500,
      headers: CACHE_CONTROL.headers
    })
  }
}