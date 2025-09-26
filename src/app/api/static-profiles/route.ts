/**
 * ✅ Static Profiles API - 자주 접근되는 프로필 데이터 최적화
 * ISR을 통한 프로필 정보 캐싱 및 성능 최적화
 */

export const runtime = 'edge'
export const revalidate = 900 // 15분마다 재생성 (프로필은 자주 바뀌지 않음)

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const CACHE_CONTROL = {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=7200',
    'CDN-Cache-Control': 'public, s-maxage=1800',
    'Vercel-CDN-Cache-Control': 'public, s-maxage=3600'
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')
    const type = url.searchParams.get('type') || 'basic'

    if (userId) {
      // 특정 사용자 프로필
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single()

      if (error || !profile) {
        return new Response(JSON.stringify({ error: 'Profile not found', profile: null }), {
          status: 404,
          headers: CACHE_CONTROL.headers
        })
      }

      return new Response(JSON.stringify({
        profile,
        cached_at: new Date().toISOString(),
        revalidate_in: 900
      }), {
        headers: CACHE_CONTROL.headers
      })
    }

    // 전체 프로필 목록 (활성 사용자)
    let query = supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    // 활성 사용자만 (최근 7일간 활동)
    if (type === 'active') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte('updated_at', weekAgo.toISOString())
    }

    const { data: profiles, error } = await query

    if (error) {
      console.error('Static profiles fetch error:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch profiles', profiles: [] }), {
        status: 500,
        headers: CACHE_CONTROL.headers
      })
    }

    return new Response(JSON.stringify({
      profiles: profiles || [],
      count: profiles?.length || 0,
      type,
      cached_at: new Date().toISOString(),
      revalidate_in: 900
    }), {
      headers: CACHE_CONTROL.headers
    })

  } catch (error) {
    console.error('Static profiles API error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      profiles: [],
      type: 'error'
    }), {
      status: 500,
      headers: CACHE_CONTROL.headers
    })
  }
}