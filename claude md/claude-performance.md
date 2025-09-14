# Performance Guide - NewBeginning

> 🎯 **최적화, 캐싱, 성능 모니터링 가이드**

---

## 📚 목차

1. [성능 최적화 전략](#성능-최적화-전략)
2. [Next.js 최적화](#nextjs-최적화)
3. [이미지 최적화](#이미지-최적화)
4. [캐싱 전략](#캐싱-전략)
5. [데이터베이스 최적화](#데이터베이스-최적화)
6. [번들 최적화](#번들-최적화)
7. [성능 모니터링](#성능-모니터링)
8. [Core Web Vitals](#core-web-vitals)

---

## ⚡ 성능 최적화 전략

### 성능 목표
```typescript
// 성능 기준값
export const PERFORMANCE_TARGETS = {
  // Core Web Vitals
  LCP: 2.5, // Largest Contentful Paint (초)
  FID: 100, // First Input Delay (ms)
  CLS: 0.1, // Cumulative Layout Shift
  
  // 추가 메트릭
  TTFB: 600, // Time To First Byte (ms)
  FCP: 1.8,  // First Contentful Paint (초)
  TTI: 5.0,  // Time To Interactive (초)
  
  // 번들 크기
  INITIAL_JS: 500 * 1024, // 500KB
  TOTAL_JS: 2 * 1024 * 1024, // 2MB
  
  // API 응답
  API_RESPONSE: 300, // 300ms 평균
  DATABASE_QUERY: 100 // 100ms 평균
} as const
```

---

## 🚀 Next.js 최적화

### 앱 라우터 최적화
```typescript
// app/layout.tsx - 최적화된 루트 레이아웃
import { Inter } from 'next/font/google'
import { Metadata } from 'next'

// 폰트 최적화
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  title: {
    template: '%s | NewBeginning',
    default: 'NewBeginning - 임신과 육아의 모든 순간'
  },
  description: '임신부터 육아까지, 모든 부모를 위한 커뮤니티',
  keywords: ['임신', '육아', '커뮤니티', '육아정보'],
  authors: [{ name: 'NewBeginning Team' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://newbeginning.vercel.app',
    siteName: 'NewBeginning'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={inter.className}>
      <head>
        {/* DNS 프리페치 */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* 프리로드 */}
        <link
          rel="preload"
          href="/api/posts"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

### 스트리밍과 Suspense
```typescript
// app/posts/loading.tsx
export default function PostsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

// app/posts/page.tsx - 스트리밍 활용
import { Suspense } from 'react'
import { PostList } from '@/components/post/post-list'
import { PostListSkeleton } from '@/components/post/post-list-skeleton'

export default function PostsPage({
  searchParams
}: {
  searchParams: { category?: string }
}) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">게시글</h1>
      
      <Suspense fallback={<PostListSkeleton />}>
        <PostList category={searchParams.category} />
      </Suspense>
    </div>
  )
}

// 컴포넌트 레벨 스트리밍
async function PostList({ category }: { category?: string }) {
  // 서버에서 데이터 페칭
  const posts = await fetchPosts({ category })
  
  return (
    <div className="grid gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

### 동적 임포트 최적화
```typescript
// 큰 컴포넌트는 동적 임포트
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(
  () => import('@/components/editor/rich-text-editor'),
  {
    ssr: false, // 클라이언트 사이드만
    loading: () => <EditorSkeleton />
  }
)

const PostChart = dynamic(
  () => import('@/components/analytics/post-chart'),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
)

// 조건부 로딩
const AdminPanel = dynamic(
  () => import('@/components/admin/admin-panel'),
  { ssr: false }
)

export default function PostEditor({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div>
      <RichTextEditor />
      {isAdmin && <AdminPanel />}
    </div>
  )
}
```

---

## 🖼️ 이미지 최적화

### Next.js Image 컴포넌트
```typescript
// components/ui/optimized-image.tsx
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  fallbackSrc?: string
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  priority = false,
  className,
  fallbackSrc = '/images/placeholder.jpg'
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setIsLoading(false)}
        onError={() => setImgSrc(fallbackSrc)}
        className={`
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}
```

### 이미지 최적화 설정
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'res.cloudinary.com',
      'supabase.co'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  }
}

module.exports = nextConfig
```

### 지연 로딩 전략
```typescript
// hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState } from 'react'

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        setHasBeenVisible(true)
      } else {
        setIsVisible(false)
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible, hasBeenVisible }
}

// 사용 예시
export function LazyPostCard({ post }: { post: Post }) {
  const { ref, hasBeenVisible } = useIntersectionObserver()

  return (
    <div ref={ref}>
      {hasBeenVisible ? (
        <PostCard post={post} />
      ) : (
        <PostCardSkeleton />
      )}
    </div>
  )
}
```

---

## 🗄️ 캐싱 전략

### 다층 캐싱 구조
```typescript
// lib/cache/cache-manager.ts
export class CacheManager {
  // Level 1: 메모리 캐시 (가장 빠름)
  private static memoryCache = new Map<string, {
    data: any
    expiry: number
  }>()

  // Level 2: 브라우저 캐시 (localStorage/sessionStorage)
  // Level 3: CDN 캐시 (Vercel Edge Cache)
  // Level 4: 데이터베이스 캐시

  static set(key: string, data: any, ttl: number = 300000) { // 5분 기본
    this.memoryCache.set(key, {
      data,
      expiry: Date.now() + ttl
    })
  }

  static get(key: string) {
    const cached = this.memoryCache.get(key)
    if (!cached) return null

    if (Date.now() > cached.expiry) {
      this.memoryCache.delete(key)
      return null
    }

    return cached.data
  }

  static invalidatePattern(pattern: string) {
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key)
      }
    }
  }
}

// SWR 기반 데이터 페칭
import useSWR from 'swr'

export function useCachedPosts(category?: string) {
  const { data, error, mutate } = useSWR(
    `/api/posts?category=${category || 'all'}`,
    async (url: string) => {
      // 메모리 캐시 확인
      const cached = CacheManager.get(url)
      if (cached) return cached

      // API 호출
      const response = await fetch(url)
      const result = await response.json()
      
      // 캐시 저장
      CacheManager.set(url, result.data, 300000) // 5분
      
      return result.data
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1분간 중복 요청 방지
      staleTime: 300000 // 5분간 stale
    }
  )

  return {
    posts: data,
    loading: !error && !data,
    error,
    refresh: mutate
  }
}
```

### HTTP 캐싱 헤더
```typescript
// app/api/posts/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  
  try {
    const posts = await fetchPosts({ category })
    
    const response = NextResponse.json({
      success: true,
      data: posts
    })
    
    // 캐싱 헤더 설정
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=60' // 5분 캐시, 1분 SWR
    )
    
    // ETag 설정
    const etag = generateETag(posts)
    response.headers.set('ETag', etag)
    
    // 조건부 요청 처리
    const ifNoneMatch = request.headers.get('If-None-Match')
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }
    
    return response
  } catch (error) {
    // 에러시 캐시하지 않음
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    )
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return errorResponse
  }
}

function generateETag(data: any): string {
  return `"${Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16)}"`
}
```

---

## 🗃️ 데이터베이스 최적화

### 쿼리 최적화
```sql
-- 인덱스 최적화
CREATE INDEX CONCURRENTLY idx_posts_category_created 
ON posts(category, created_at DESC) 
WHERE NOT is_deleted;

CREATE INDEX CONCURRENTLY idx_posts_fulltext 
ON posts USING GIN(to_tsvector('korean', title || ' ' || content));

-- 부분 인덱스로 성능 향상
CREATE INDEX CONCURRENTLY idx_posts_active 
ON posts(created_at DESC) 
WHERE NOT is_deleted AND published = true;

-- 쿼리 성능 분석
EXPLAIN (ANALYZE, BUFFERS) 
SELECT p.*, pr.username 
FROM posts p
JOIN profiles pr ON pr.id = p.user_id
WHERE p.category = 'expecting'
ORDER BY p.created_at DESC
LIMIT 20;
```

### 연결 풀링 최적화
```typescript
// lib/database/connection-pool.ts
import { Pool } from 'pg'

export const connectionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // 최대 연결 수
  min: 5,  // 최소 연결 수
  idle: 10000, // 10초 유휴 시간
  connectionTimeoutMillis: 3000, // 3초 연결 타임아웃
  idleTimeoutMillis: 30000, // 30초 유휴 연결 해제
  allowExitOnIdle: true
})

// 연결 모니터링
connectionPool.on('connect', (client) => {
  console.log('New client connected:', client.processID)
})

connectionPool.on('remove', (client) => {
  console.log('Client removed:', client.processID)
})

connectionPool.on('error', (err) => {
  console.error('Pool error:', err)
})
```

---

## 📦 번들 최적화

### Webpack Bundle Analyzer
```bash
# 번들 분석
npm install --save-dev @next/bundle-analyzer

# package.json
"scripts": {
  "analyze": "ANALYZE=true next build"
}
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // Tree shaking 최적화
  experimental: {
    optimizeCss: true,
    swcMinify: true
  },
  
  // 번들 분할
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        ui: {
          test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
          name: 'ui',
          chunks: 'all',
          priority: 5
        }
      }
    }
    return config
  }
})
```

### 코드 분할 전략
```typescript
// 라우트 기반 분할은 자동
// 컴포넌트 기반 분할
const PostEditor = dynamic(() => 
  import('@/components/editor/post-editor').then(mod => ({
    default: mod.PostEditor
  }))
)

// 라이브러리 분할
const ChartComponent = dynamic(() => 
  import('recharts').then(mod => mod.BarChart), 
  { ssr: false }
)

// 조건부 분할
const AdminTools = dynamic(() => 
  import('@/components/admin/admin-tools'), 
  { 
    ssr: false,
    loading: () => <AdminToolsSkeleton />
  }
)
```

---

## 📊 성능 모니터링

### Web Vitals 측정
```typescript
// lib/analytics/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function measureWebVitals() {
  getCLS(metric => {
    console.log('CLS:', metric)
    sendToAnalytics('CLS', metric.value)
  })

  getFID(metric => {
    console.log('FID:', metric)
    sendToAnalytics('FID', metric.value)
  })

  getFCP(metric => {
    console.log('FCP:', metric)
    sendToAnalytics('FCP', metric.value)
  })

  getLCP(metric => {
    console.log('LCP:', metric)
    sendToAnalytics('LCP', metric.value)
  })

  getTTFB(metric => {
    console.log('TTFB:', metric)
    sendToAnalytics('TTFB', metric.value)
  })
}

function sendToAnalytics(name: string, value: number) {
  if (typeof gtag !== 'undefined') {
    gtag('event', name, {
      custom_parameter_1: value
    })
  }
}

// _app.tsx에서 사용
export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    measureWebVitals()
  }, [])

  return <Component {...pageProps} />
}
```

### 성능 프로파일러
```typescript
// lib/performance/profiler.ts
export class PerformanceProfiler {
  private static marks = new Map<string, number>()

  static mark(name: string) {
    this.marks.set(name, performance.now())
    if (typeof performance.mark !== 'undefined') {
      performance.mark(name)
    }
  }

  static measure(name: string, startMark: string, endMark?: string) {
    const startTime = this.marks.get(startMark)
    const endTime = endMark ? this.marks.get(endMark) : performance.now()
    
    if (startTime && endTime) {
      const duration = endTime - startTime
      console.log(`${name}: ${duration.toFixed(2)}ms`)
      
      if (typeof performance.measure !== 'undefined') {
        performance.measure(name, startMark, endMark)
      }
      
      return duration
    }
    
    return 0
  }

  static getResourceTimings() {
    return performance.getEntriesByType('resource').map(entry => ({
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize
    }))
  }

  static getNavigationTiming() {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    return {
      domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
      load: nav.loadEventEnd - nav.loadEventStart,
      ttfb: nav.responseStart - nav.requestStart,
      domComplete: nav.domComplete - nav.domLoading
    }
  }
}

// 컴포넌트에서 사용
export function ProfiledComponent({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    PerformanceProfiler.mark('component-mount-start')
    
    return () => {
      PerformanceProfiler.mark('component-mount-end')
      PerformanceProfiler.measure(
        'component-mount', 
        'component-mount-start', 
        'component-mount-end'
      )
    }
  }, [])

  return <>{children}</>
}
```

---

## 🎯 Core Web Vitals

### LCP 최적화
```typescript
// 가장 큰 콘텐츠풀 페인트 최적화
// 1. 중요한 리소스 프리로드
export function PreloadCriticalResources() {
  return (
    <Head>
      <link
        rel="preload"
        href="/hero-image.jpg"
        as="image"
        type="image/jpeg"
      />
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
    </Head>
  )
}

// 2. 히어로 이미지 최적화
export function HeroSection() {
  return (
    <section className="relative h-screen">
      <Image
        src="/hero-image.jpg"
        alt="NewBeginning Hero"
        fill
        priority // LCP 요소는 priority 설정
        quality={85}
        sizes="100vw"
        className="object-cover"
      />
    </section>
  )
}
```

### FID 최적화
```typescript
// 첫 번째 입력 지연 최적화
// 1. 큰 JavaScript 작업 분할
export function useTaskScheduler() {
  const scheduleTask = useCallback((task: () => void) => {
    if ('scheduler' in window && 'postTask' in window.scheduler) {
      // @ts-ignore
      window.scheduler.postTask(task, { priority: 'user-blocking' })
    } else {
      // 폴백: requestIdleCallback 사용
      if (window.requestIdleCallback) {
        requestIdleCallback(task, { timeout: 5000 })
      } else {
        setTimeout(task, 0)
      }
    }
  }, [])

  return { scheduleTask }
}

// 2. 입력 응답성 개선
export function OptimizedInput({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [value, setValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { scheduleTask } = useTaskScheduler()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // 무거운 작업을 스케줄링
    scheduleTask(() => {
      onSubmit(value)
      setIsProcessing(false)
    })
  }, [value, onSubmit, scheduleTask])

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isProcessing}
        placeholder="입력하세요..."
      />
      <button type="submit" disabled={isProcessing}>
        {isProcessing ? '처리 중...' : '제출'}
      </button>
    </form>
  )
}
```

### CLS 최적화
```typescript
// 누적 레이아웃 이동 최적화
// 1. 이미지 크기 명시
export function StableImage({ src, alt }: { src: string, alt: string }) {
  return (
    <div className="relative aspect-video"> {/* 고정 비율 */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  )
}

// 2. 스켈레톤 UI로 레이아웃 안정성
export function PostCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="mt-4 h-48 bg-gray-200 rounded"></div>
    </div>
  )
}

// 3. 동적 콘텐츠 공간 예약
export function DynamicContent() {
  const [content, setContent] = useState<string | null>(null)

  return (
    <div className="min-h-[200px]"> {/* 최소 높이 보장 */}
      {content ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div className="h-48 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  )
}
```

---

**📝 마지막 업데이트**: 2025-09-13  
**🔄 다음 리뷰 예정**: 2025-10-13  
**📖 관련 문서**: [CLAUDE.md](./CLAUDE.md) | [claude-development.md](./claude-development.md)