/**
 * ✅ Static Data Client - ISR 최적화된 데이터 접근 레이어
 * 클라이언트 사이드 번들 크기 최소화와 성능 최적화
 */

interface StaticPostsResponse {
  posts: any[]
  count: number
  type: string
  cached_at: string
  revalidate_in: number
  error?: string
}

interface StaticProfilesResponse {
  profiles?: any[]
  profile?: any
  count?: number
  type?: string
  cached_at: string
  revalidate_in: number
  error?: string
}

// ✅ 캐시된 정적 게시글 가져오기
export async function getStaticPosts(
  type: 'featured' | 'popular' | 'community' = 'featured',
  limit: number = 10
): Promise<StaticPostsResponse> {
  try {
    const params = new URLSearchParams({
      type,
      limit: limit.toString()
    })

    const response = await fetch(`/api/static-posts?${params}`, {
      // 클라이언트 사이드 캐싱도 활용
      next: {
        revalidate: 300 // 5분
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data: StaticPostsResponse = await response.json()

    console.log(`📊 Static posts fetched: ${data.count} ${type} posts (cached: ${data.cached_at})`)

    return data

  } catch (error: any) {
    console.error('Static posts fetch failed:', error.message)
    return {
      posts: [],
      count: 0,
      type,
      cached_at: new Date().toISOString(),
      revalidate_in: 300,
      error: error.message
    }
  }
}

// ✅ 캐시된 정적 프로필 가져오기
export async function getStaticProfiles(
  type: 'basic' | 'active' = 'basic'
): Promise<StaticProfilesResponse> {
  try {
    const params = new URLSearchParams({ type })

    const response = await fetch(`/api/static-profiles?${params}`, {
      next: {
        revalidate: 900 // 15분
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data: StaticProfilesResponse = await response.json()

    console.log(`👥 Static profiles fetched: ${data.count} ${type} profiles (cached: ${data.cached_at})`)

    return data

  } catch (error: any) {
    console.error('Static profiles fetch failed:', error.message)
    return {
      profiles: [],
      count: 0,
      type,
      cached_at: new Date().toISOString(),
      revalidate_in: 900,
      error: error.message
    }
  }
}

// ✅ 특정 사용자 프로필 가져오기 (캐시됨)
export async function getStaticUserProfile(userId: string): Promise<StaticProfilesResponse> {
  try {
    const params = new URLSearchParams({ user_id: userId })

    const response = await fetch(`/api/static-profiles?${params}`, {
      next: {
        revalidate: 900 // 15분
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data: StaticProfilesResponse = await response.json()

    console.log(`👤 Static user profile fetched: ${userId} (cached: ${data.cached_at})`)

    return data

  } catch (error: any) {
    console.error('Static user profile fetch failed:', error.message)
    return {
      profile: null,
      cached_at: new Date().toISOString(),
      revalidate_in: 900,
      error: error.message
    }
  }
}

// ✅ 데이터 프리페칭 (성능 최적화)
export function prefetchStaticData() {
  // 중요한 데이터 미리 로딩 (background)
  if (typeof window !== 'undefined') {
    // Featured posts 프리페칭
    setTimeout(() => {
      fetch('/api/static-posts?type=featured&limit=10').catch(() => {})
    }, 1000)

    // Community posts 프리페칭
    setTimeout(() => {
      fetch('/api/static-posts?type=community&limit=5').catch(() => {})
    }, 2000)

    // Active profiles 프리페칭
    setTimeout(() => {
      fetch('/api/static-profiles?type=active').catch(() => {})
    }, 3000)
  }
}

// ✅ 캐시 무효화 헬퍼 (관리자용)
export async function invalidateStaticCache(type: 'posts' | 'profiles' | 'all' = 'all') {
  try {
    const endpoints = []

    if (type === 'posts' || type === 'all') {
      endpoints.push('/api/revalidate?path=/api/static-posts')
    }

    if (type === 'profiles' || type === 'all') {
      endpoints.push('/api/revalidate?path=/api/static-profiles')
    }

    const results = await Promise.allSettled(
      endpoints.map(endpoint => fetch(endpoint, { method: 'POST' }))
    )

    console.log(`🔄 Cache invalidation requested for ${type}:`, results)

    return {
      success: true,
      results: results.length
    }

  } catch (error: any) {
    console.error('Cache invalidation failed:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}