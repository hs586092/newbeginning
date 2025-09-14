# Troubleshooting Guide - NewBeginning

> 🎯 **자주 발생하는 문제 해결 및 디버깅 가이드**

---

## 📚 목차

1. [일반적인 문제들](#일반적인-문제들)
2. [Next.js 관련 문제](#nextjs-관련-문제)
3. [Supabase 관련 문제](#supabase-관련-문제)
4. [인증 문제](#인증-문제)
5. [성능 문제](#성능-문제)
6. [배포 문제](#배포-문제)
7. [디버깅 도구](#디버깅-도구)
8. [로그 분석](#로그-분석)

---

## 🚨 일반적인 문제들

### 1. "UUID format invalid" 에러
```typescript
// ❌ 문제 코드
const handleUserAction = (userId: string) => {
  // UUID 검증 없이 직접 사용
  supabase.from('posts').select().eq('user_id', userId)
}

// ✅ 해결 방법
import { isValidUUID } from '@/lib/utils'

const handleUserAction = (userId: string) => {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format')
    // 또는 return { error: 'Invalid user ID' }
  }
  
  return supabase.from('posts').select().eq('user_id', userId)
}

// 유틸 함수
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
```

### 2. "Hydration failed" 에러
```typescript
// ❌ 문제: 서버와 클라이언트 렌더링 결과가 다름
const Component = () => {
  return <div>{new Date().toISOString()}</div> // 매번 다른 시간
}

// ✅ 해결 방법 1: useEffect 사용
const Component = () => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <div>Loading...</div>
  }
  
  return <div>{new Date().toISOString()}</div>
}

// ✅ 해결 방법 2: dynamic import with ssr: false
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(
  () => import('@/components/client-only-component'),
  { ssr: false, loading: () => <p>Loading...</p> }
)

// ✅ 해결 방법 3: suppressHydrationWarning (주의해서 사용)
const Component = () => {
  return (
    <div suppressHydrationWarning>
      {typeof window !== 'undefined' && new Date().toISOString()}
    </div>
  )
}
```

### 3. TypeScript 타입 에러
```typescript
// ❌ 문제: any 타입 사용
const handleData = (data: any) => {
  return data.user.profile.name // 런타임 에러 가능성
}

// ✅ 해결: 적절한 타입 가드
interface User {
  profile?: {
    name?: string
  }
}

interface ApiResponse {
  user?: User
}

const handleData = (data: ApiResponse) => {
  if (!data.user?.profile?.name) {
    return 'Unknown User'
  }
  return data.user.profile.name
}

// 또는 zod를 사용한 런타임 검증
import { z } from 'zod'

const UserSchema = z.object({
  user: z.object({
    profile: z.object({
      name: z.string()
    }).optional()
  }).optional()
})

const handleData = (data: unknown) => {
  try {
    const parsed = UserSchema.parse(data)
    return parsed.user?.profile?.name || 'Unknown User'
  } catch (error) {
    console.error('Invalid data format:', error)
    return 'Unknown User'
  }
}
```

---

## ⚛️ Next.js 관련 문제

### 1. API Route 404 에러
```typescript
// ❌ 잘못된 파일 구조
// app/api/posts.ts (잘못됨)

// ✅ 올바른 파일 구조
// app/api/posts/route.ts

// route.ts 파일 예시
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello from API' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ received: body })
}
```

### 2. 환경 변수가 undefined
```bash
# ❌ 문제: 클라이언트에서 환경 변수 접근 불가
# .env.local
DATABASE_URL=postgres://...
API_KEY=secret-key

# ✅ 해결: NEXT_PUBLIC_ 접두사 사용 (공개해도 되는 경우만)
# .env.local
NEXT_PUBLIC_APP_URL=https://myapp.com
DATABASE_URL=postgres://... # 서버에서만 접근 가능
```

```typescript
// ✅ 올바른 환경 변수 사용
// 클라이언트에서
const appUrl = process.env.NEXT_PUBLIC_APP_URL

// 서버에서만
const dbUrl = process.env.DATABASE_URL // API routes, Server Components에서만

// 환경 변수 검증
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}
```

### 3. 이미지 최적화 에러
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 외부 이미지 도메인 등록 필요
    domains: [
      'images.unsplash.com',
      'your-supabase-project.supabase.co',
      'cdn.example.com'
    ],
    // 또는 remotePatterns 사용 (권장)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  }
}

module.exports = nextConfig
```

### 4. "Cannot read properties of undefined" 에러
```typescript
// ❌ 문제 코드
const ProfilePage = ({ params }: { params: { id: string } }) => {
  const [user, setUser] = useState(null)
  
  return (
    <div>
      <h1>{user.name}</h1> {/* user가 null일 때 에러 */}
    </div>
  )
}

// ✅ 해결 방법
const ProfilePage = ({ params }: { params: { id: string } }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const userData = await getUserById(params.id)
        setUser(userData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) {
      fetchUser()
    }
  }, [params.id])
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!user) return <div>User not found</div>
  
  return (
    <div>
      <h1>{user.name}</h1>
    </div>
  )
}
```

---

## 🗄️ Supabase 관련 문제

### 1. RLS (Row Level Security) 정책 에러
```sql
-- ❌ 문제: 너무 제한적인 정책
CREATE POLICY "users_can_only_see_own_posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

-- ✅ 해결: 적절한 정책
CREATE POLICY "posts_are_publicly_readable" ON posts
  FOR SELECT USING (true);

CREATE POLICY "users_can_insert_own_posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);
```

### 2. Supabase 클라이언트 초기화 문제
```typescript
// ❌ 문제: 잘못된 클라이언트 생성
import { createClient } from '@supabase/supabase-js'

// 매번 새로운 인스턴스 생성 (메모리 낭비)
export const getSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ✅ 해결: 싱글톤 패턴
let supabase: SupabaseClient | undefined

export const getSupabase = () => {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabase
}

// ✅ 더 나은 해결: Next.js 헬퍼 사용
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()
```

### 3. 실시간 구독 메모리 누수
```typescript
// ❌ 문제: 구독 해제하지 않음
const Component = () => {
  useEffect(() => {
    const subscription = supabase
      .channel('posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        console.log('New post:', payload)
      })
      .subscribe()
    
    // cleanup 함수가 없어서 메모리 누수 발생
  }, [])
}

// ✅ 해결: 적절한 cleanup
const Component = () => {
  useEffect(() => {
    const subscription = supabase
      .channel('posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        console.log('New post:', payload)
      })
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
}
```

### 4. 쿼리 성능 문제
```typescript
// ❌ 문제: N+1 쿼리
const getPosts = async () => {
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
  
  // 각 게시글마다 별도 쿼리 (N+1 문제)
  const postsWithAuthors = await Promise.all(
    posts?.map(async (post) => {
      const { data: author } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', post.user_id)
        .single()
      
      return { ...post, author }
    }) || []
  )
  
  return postsWithAuthors
}

// ✅ 해결: JOIN 사용
const getPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        avatar_url
      )
    `)
  
  if (error) throw error
  return data
}
```

---

## 🔐 인증 문제

### 1. 세션 만료 에러
```typescript
// ❌ 문제: 세션 상태 확인하지 않음
const Component = () => {
  const { user } = useAuth()
  
  const handleAction = async () => {
    // 세션이 만료되었을 수 있음
    const { data, error } = await supabase
      .from('posts')
      .insert([{ title: 'New Post', user_id: user.id }])
  }
}

// ✅ 해결: 세션 검증 및 자동 갱신
const useAuthWithRefresh = () => {
  const [session, setSession] = useState<Session | null>(null)
  
  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    
    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully')
        }
        
        if (event === 'SIGNED_OUT') {
          // 로그아웃 처리
          router.push('/login')
        }
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('Session refresh failed:', error)
      router.push('/login')
    }
    return data.session
  }
  
  return { session, refreshSession }
}
```

### 2. PKCE 플로우 에러
```typescript
// ✅ PKCE 플로우 올바른 구현
const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    // 특정 에러 타입별 처리
    if (error.message === 'Email not confirmed') {
      // 이메일 확인 필요
      router.push('/auth/verify-email')
    } else if (error.message === 'Invalid login credentials') {
      // 잘못된 인증 정보
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    } else {
      setError(error.message)
    }
  }
  
  return { data, error }
}

const signInWithProvider = async (provider: 'google' | 'github') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  })
  
  if (error) {
    console.error('OAuth sign in error:', error)
  }
  
  return { data, error }
}
```

---

## 🐌 성능 문제

### 1. 느린 페이지 로딩
```typescript
// ❌ 문제: 모든 데이터를 한번에 로딩
const HomePage = async () => {
  const posts = await getAllPosts() // 너무 많은 데이터
  const users = await getAllUsers()
  const comments = await getAllComments()
  
  return <div>{/* 렌더링 */}</div>
}

// ✅ 해결: 점진적 로딩과 Suspense
const HomePage = () => {
  return (
    <div>
      <Suspense fallback={<PostsLoading />}>
        <PostsList />
      </Suspense>
      
      <Suspense fallback={<UsersLoading />}>
        <UsersList />
      </Suspense>
    </div>
  )
}

// 개별 컴포넌트에서 필요한 데이터만 로딩
async function PostsList() {
  const posts = await getRecentPosts(10) // 최근 10개만
  
  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      <LoadMoreButton />
    </div>
  )
}
```

### 2. 메모리 누수
```typescript
// ❌ 문제: 정리되지 않는 이벤트 리스너
const Component = () => {
  useEffect(() => {
    const handleScroll = () => {
      console.log('Scrolling...')
    }
    
    window.addEventListener('scroll', handleScroll)
    // cleanup이 없어서 메모리 누수
  }, [])
}

// ✅ 해결: 적절한 cleanup
const Component = () => {
  useEffect(() => {
    const handleScroll = throttle(() => {
      console.log('Scrolling...')
    }, 100)
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
}

// 커스텀 훅으로 재사용 가능하게
const useScrollListener = (callback: () => void, throttleMs = 100) => {
  useEffect(() => {
    const throttledCallback = throttle(callback, throttleMs)
    
    window.addEventListener('scroll', throttledCallback)
    return () => window.removeEventListener('scroll', throttledCallback)
  }, [callback, throttleMs])
}
```

---

## 🚀 배포 문제

### 1. Vercel 배포 실패
```bash
# 원인 1: 빌드 에러
npm run build # 로컬에서 빌드 테스트

# 원인 2: 환경 변수 누락
# Vercel 대시보드에서 환경 변수 확인

# 원인 3: 메모리 부족
export NODE_OPTIONS="--max-old-space-size=4096"

# 원인 4: 의존성 문제
npm ci --legacy-peer-deps
```

### 2. 환경별 설정 문제
```typescript
// ✅ 환경별 설정 분리
const config = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    debug: true
  },
  production: {
    apiUrl: 'https://your-app.vercel.app/api',
    debug: false
  },
  staging: {
    apiUrl: 'https://staging.your-app.vercel.app/api',
    debug: true
  }
}

export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  return config[env as keyof typeof config]
}
```

---

## 🛠️ 디버깅 도구

### 1. React DevTools 활용
```typescript
// 컴포넌트 성능 프로파일링
import { Profiler } from 'react'

function onRenderCallback(id: string, phase: string, actualDuration: number) {
  console.log('Render:', id, phase, actualDuration)
}

export function ProfiledApp() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <App />
    </Profiler>
  )
}
```

### 2. 커스텀 로깅 시스템
```typescript
// lib/logger.ts
export class Logger {
  private static isDev = process.env.NODE_ENV === 'development'
  
  static debug(message: string, data?: any) {
    if (this.isDev) {
      console.log(`🐛 [DEBUG] ${message}`, data || '')
    }
  }
  
  static error(message: string, error?: Error) {
    console.error(`❌ [ERROR] ${message}`, error || '')
    
    // 프로덕션에서는 에러 추적 서비스로 전송
    if (!this.isDev && error) {
      // Sentry.captureException(error)
    }
  }
  
  static performance(label: string, fn: () => Promise<any>) {
    return async () => {
      const start = performance.now()
      try {
        const result = await fn()
        const end = performance.now()
        console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`)
        return result
      } catch (error) {
        const end = performance.now()
        console.log(`💥 ${label} failed after ${(end - start).toFixed(2)}ms`)
        throw error
      }
    }
  }
}

// 사용 예시
const fetchData = Logger.performance('Fetch Posts', async () => {
  const response = await fetch('/api/posts')
  return response.json()
})
```

### 3. 에러 바운더리
```typescript
// components/error-boundary.tsx
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="error-boundary p-6 bg-red-50 border border-red-200 rounded">
      <h2 className="text-lg font-semibold text-red-800 mb-2">
        문제가 발생했습니다
      </h2>
      <details className="mb-4">
        <summary className="cursor-pointer text-red-600">
          에러 상세 정보
        </summary>
        <pre className="mt-2 text-sm bg-red-100 p-2 rounded">
          {error.message}
        </pre>
      </details>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        다시 시도
      </button>
    </div>
  )
}

export function AppWithErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        Logger.error('React Error Boundary caught error:', error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```

---

## 📊 로그 분석

### 서버 로그 분석
```bash
# Vercel 함수 로그 확인
vercel logs --follow

# 특정 함수 로그
vercel logs --function=api/posts

# 에러 로그 필터링
vercel logs | grep ERROR

# 성능 로그 분석
vercel logs | grep "Duration:"
```

### 클라이언트 에러 추적
```typescript
// lib/error-tracking.ts
export class ErrorTracker {
  static track(error: Error, context?: Record<string, any>) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      context
    }
    
    // 로컬 스토리지에 임시 저장
    const errors = JSON.parse(localStorage.getItem('clientErrors') || '[]')
    errors.push(errorData)
    
    // 최대 100개만 유지
    if (errors.length > 100) {
      errors.splice(0, errors.length - 100)
    }
    
    localStorage.setItem('clientErrors', JSON.stringify(errors))
    
    // 서버로 전송 (배치 처리)
    this.sendErrorBatch()
  }
  
  private static async sendErrorBatch() {
    const errors = JSON.parse(localStorage.getItem('clientErrors') || '[]')
    if (errors.length === 0) return
    
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors })
      })
      
      // 전송 성공시 로컬 스토리지 정리
      localStorage.removeItem('clientErrors')
    } catch (err) {
      console.error('Failed to send error batch:', err)
    }
  }
}

// 전역 에러 핸들러
window.addEventListener('error', (event) => {
  ErrorTracker.track(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

window.addEventListener('unhandledrejection', (event) => {
  ErrorTracker.track(new Error(event.reason), {
    type: 'unhandledPromiseRejection'
  })
})
```

---

**📝 마지막 업데이트**: 2025-09-13  
**🔄 다음 리뷰 예정**: 2025-10-13  
**📖 관련 문서**: [CLAUDE.md](./CLAUDE.md) | [claude-development.md](./claude-development.md) | [claude-performance.md](./claude-performance.md)