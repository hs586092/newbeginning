/**
 * 장소 리뷰 요약 API with Caching
 *
 * POST /api/summarize-place
 * Body: { placeName: string }
 *
 * Features:
 * - 3-level cache key lookup (naver_place_id, normalized_name, query)
 * - Stale-While-Revalidate pattern
 * - 5-level graceful degradation
 * - Distributed locks to prevent duplicate crawling
 * - Performance monitoring with 10% sampling
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchPlaceSummary } from '@/lib/fetch-place-summary'

// Set Vercel Pro timeout (30 seconds max)
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const { placeName } = await request.json()

    if (!placeName || typeof placeName !== 'string') {
      return NextResponse.json(
        { error: '장소명을 입력해주세요' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI API 키가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase 설정이 필요합니다' },
        { status: 500 }
      )
    }

    // Main logic with caching
    const response = await fetchPlaceSummary(placeName)

    // Return with appropriate status code
    const statusCode = response.status === 'minimal' ? 500 : 200

    return NextResponse.json(response, { status: statusCode })

  } catch (error: any) {
    console.error('요약 생성 실패:', error)

    return NextResponse.json(
      {
        status: 'minimal',
        data: {
          placeName: '',
          place_name_original: '',
          summary: '서비스 오류가 발생했습니다',
          pros: [],
          cons: [],
          sentiment: 'neutral' as const,
          naverMapUrl: '',
          reviewCount: 0
        },
        is_fresh: false,
        error: error.message || '리뷰 요약에 실패했습니다'
      },
      { status: 500 }
    )
  }
}
