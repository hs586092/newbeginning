# API Design Guide - NewBeginning

> 🎯 **API 설계, 엔드포인트, 응답 포맷 상세 가이드**

---

## 📚 목차

1. [API 설계 원칙](#api-설계-원칙)
2. [라우팅 구조](#라우팅-구조)
3. [응답 포맷 표준](#응답-포맷-표준)
4. [인증 & 권한](#인증--권한)
5. [에러 처리](#에러-처리)
6. [페이지네이션](#페이지네이션)
7. [파일 업로드](#파일-업로드)
8. [실시간 API](#실시간-api)
9. [API 테스팅](#api-테스팅)

---

## 🎯 API 설계 원칙

### 1. RESTful 설계
```typescript
// ✅ 표준 RESTful 패턴
GET    /api/posts           // 게시글 목록 조회
GET    /api/posts/:id       // 특정 게시글 조회
POST   /api/posts           // 게시글 생성
PUT    /api/posts/:id       // 게시글 전체 수정
PATCH  /api/posts/:id       // 게시글 부분 수정
DELETE /api/posts/:id       // 게시글 삭제

// ✅ 중첩 리소스
GET    /api/posts/:id/comments     // 게시글의 댓글 목록
POST   /api/posts/:id/comments     // 게시글에 댓글 추가
DELETE /api/comments/:id           // 댓글 삭제

// ✅ 액션 기반 엔드포인트
POST   /api/posts/:id/like         // 좋아요 토글
POST   /api/posts/:id/bookmark     // 북마크 토글
POST   /api/users/:id/follow       // 팔로우 토글
```

### 2. URL 명명 규칙
```typescript
// ✅ 좋은 예
/api/posts                    // 복수형 명사
/api/posts/123/comments       // 계층적 구조
/api/users/profile            // 의미 명확
/api/posts/search?q=keyword   // 쿼리 파라미터 활용

// ❌ 나쁜 예
/api/getPost/123              // 동사 포함
/api/post_comments            // 언더스코어 사용
/api/PostsByUser              // camelCase 사용
/api/posts/123/comment        // 단수형 (복수 리소스인 경우)
```

---

## 🗂️ 라우팅 구조

### 파일 구조
```
src/app/api/
├── auth/                    # 인증 관련
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── refresh/route.ts
├── posts/                   # 게시글
│   ├── route.ts            # GET, POST /api/posts
│   ├── [id]/
│   │   ├── route.ts        # GET, PUT, DELETE /api/posts/:id
│   │   ├── comments/route.ts
│   │   ├── like/route.ts
│   │   └── bookmark/route.ts
│   └── search/route.ts
├── users/                   # 사용자
│   ├── route.ts
│   ├── [id]/
│   │   ├── route.ts
│   │   ├── posts/route.ts
│   │   └── profile/route.ts
│   └── me/
│       ├── route.ts
│       └── settings/route.ts
├── upload/                  # 파일 업로드
│   └── route.ts
└── health/                  # 헬스체크
    └── route.ts
```

### 라우트 핸들러 템플릿
```typescript
// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { z } from 'zod'
import type { Database } from '@/types/database.types'

// 요청 검증 스키마
const CreatePostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  category: z.enum(['expecting', 'newborn', 'toddler', 'expert']),
  baby_month: z.number().min(0).max(36).optional(),
  tags: z.array(z.string()).max(5).optional()
})

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies: () => request.cookies })
  
  try {
    // 쿼리 파라미터 파싱
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    
    // 데이터 조회
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        ),
        _count:likes!left (count),
        _count_comments:comments!left (count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query

    if (error) throw error

    // 성공 응답
    return NextResponse.json({
      success: true,
      data,
      meta: {
        total: count || 0,
        limit,
        offset,
        hasNext: (data?.length || 0) === limit
      }
    })

  } catch (error) {
    console.error('Posts fetch error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: '게시글을 불러오는데 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies: () => request.cookies })
  
  try {
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '로그인이 필요합니다.'
        }
      }, { status: 401 })
    }

    // 요청 데이터 검증
    const body = await request.json()
    const validatedData = CreatePostSchema.parse(body)

    // 사용자 프로필 정보 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: '사용자 프로필을 찾을 수 없습니다.'
        }
      }, { status: 400 })
    }

    // 게시글 생성
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        ...validatedData,
        user_id: user.id,
        author_name: profile.username
      }])
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: '게시글이 생성되었습니다.'
    }, { status: 201 })

  } catch (error) {
    console.error('Post creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '입력 데이터가 올바르지 않습니다.',
          details: error.errors
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'CREATION_ERROR',
        message: '게시글 생성에 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}
```

---

## 📊 응답 포맷 표준

### 표준 응답 구조
```typescript
// types/api.types.ts
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: APIError
  message?: string
  meta?: APIMeta
}

export interface APIError {
  code: string
  message: string
  details?: any
}

export interface APIMeta {
  total?: number
  page?: number
  limit?: number
  offset?: number
  hasNext?: boolean
  hasPrev?: boolean
}
```

### 성공 응답 예시
```typescript
// ✅ 단일 리소스 조회 성공
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "첫 임신, 궁금한 점들",
    "content": "임신 초기 주의사항에 대해 알고 싶어요...",
    "category": "expecting",
    "created_at": "2025-01-13T10:30:00Z",
    "profiles": {
      "username": "mom_to_be",
      "avatar_url": "https://..."
    },
    "_count": {
      "likes": 15,
      "comments": 8
    }
  },
  "message": "게시글을 성공적으로 조회했습니다."
}

// ✅ 목록 조회 성공 (페이지네이션 포함)
{
  "success": true,
  "data": [
    {
      "id": "123e4567-...",
      "title": "...",
      // ... 게시글 데이터
    }
  ],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasNext": true,
    "hasPrev": false
  }
}

// ✅ 생성/수정 성공
{
  "success": true,
  "data": {
    "id": "123e4567-...",
    // ... 생성된 데이터
  },
  "message": "게시글이 생성되었습니다."
}

// ✅ 액션 성공 (좋아요 등)
{
  "success": true,
  "data": {
    "liked": true,
    "like_count": 16
  },
  "message": "좋아요가 추가되었습니다."
}
```

### 에러 응답 예시
```typescript
// ❌ 인증 에러
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "로그인이 필요합니다."
  }
}

// ❌ 권한 에러
{
  "success": false,
  "error": {
    "code": "FORBIDDEN", 
    "message": "이 작업을 수행할 권한이 없습니다."
  }
}

// ❌ 유효성 검사 에러
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 올바르지 않습니다.",
    "details": [
      {
        "field": "title",
        "message": "제목은 필수입니다."
      },
      {
        "field": "content", 
        "message": "내용은 1000자를 초과할 수 없습니다."
      }
    ]
  }
}

// ❌ 리소스 없음
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "게시글을 찾을 수 없습니다."
  }
}

// ❌ 서버 에러
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "서버 오류가 발생했습니다.",
    "details": "Database connection failed" // 개발 환경에서만
  }
}
```

---

## 🔐 인증 & 권한

### JWT 토큰 검증
```typescript
// lib/auth/jwt.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

export async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies: () => request.cookies })
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { user: null, error: 'UNAUTHORIZED' }
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: 'AUTH_ERROR' }
  }
}

// 권한 확인 헬퍼
export async function requireAuth(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser(request)
  
  if (!user) {
    return NextResponse.json({
      success: false,
      error: {
        code: error || 'UNAUTHORIZED',
        message: '로그인이 필요합니다.'
      }
    }, { status: 401 })
  }
  
  return { user }
}

// 권한별 미들웨어
export async function requireOwnership(
  request: NextRequest, 
  resourceUserId: string
) {
  const { user } = await getAuthenticatedUser(request)
  
  if (!user) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.'
      }
    }, { status: 401 })
  }

  if (user.id !== resourceUserId) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: '이 작업을 수행할 권한이 없습니다.'
      }
    }, { status: 403 })
  }

  return { user }
}
```

### 권한 기반 라우터 보호
```typescript
// src/app/api/posts/[id]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 게시글 존재 여부 및 소유자 확인
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (postError || !post) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '게시글을 찾을 수 없습니다.'
        }
      }, { status: 404 })
    }

    // 소유자 권한 확인
    const authResponse = await requireOwnership(request, post.user_id)
    if (authResponse instanceof NextResponse) {
      return authResponse // 에러 응답
    }

    const { user } = authResponse

    // 업데이트 로직 수행
    // ...

  } catch (error) {
    // 에러 처리
  }
}
```

---

## ⚠️ 에러 처리

### 에러 코드 표준화
```typescript
// constants/errorCodes.ts
export const ERROR_CODES = {
  // 인증 관련
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // 유효성 검사
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_UUID: 'INVALID_UUID',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // 리소스 관련
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // 서버 오류
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // 비즈니스 로직
  POST_LIMIT_EXCEEDED: 'POST_LIMIT_EXCEEDED',
  COMMENT_ON_DELETED_POST: 'COMMENT_ON_DELETED_POST',
  SELF_FOLLOW_FORBIDDEN: 'SELF_FOLLOW_FORBIDDEN'
} as const

export type ErrorCode = keyof typeof ERROR_CODES
```

### 에러 처리 유틸리티
```typescript
// lib/errors/apiError.ts
export class APIError extends Error {
  code: ErrorCode
  statusCode: number
  details?: any

  constructor(code: ErrorCode, message: string, statusCode = 500, details?: any) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// 에러 응답 생성 헬퍼
export function createErrorResponse(
  error: APIError | Error | unknown,
  statusCode = 500
): NextResponse {
  if (error instanceof APIError) {
    return NextResponse.json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details })
      }
    }, { status: error.statusCode })
  }

  // 일반 Error 처리
  if (error instanceof Error) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다.',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }
    }, { status: statusCode })
  }

  // 알 수 없는 에러
  return NextResponse.json({
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다.'
    }
  }, { status: 500 })
}

// try-catch 래퍼
export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      return createErrorResponse(error)
    }
  }
}
```

---

## 📄 페이지네이션

### 오프셋 기반 페이지네이션
```typescript
// lib/pagination.ts
export interface PaginationOptions {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginationResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function parsePaginationParams(url: URL): PaginationOptions {
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

// 페이지네이션 쿼리 실행
export async function paginatedQuery<T>(
  query: any,
  pagination: PaginationOptions
): Promise<PaginationResult<T>> {
  const { page = 1, limit = 20, offset = 0 } = pagination

  const { data, error, count } = await query
    .range(offset, offset + limit - 1)

  if (error) throw error

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    data: data || [],
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}
```

### 커서 기반 페이지네이션 (무한 스크롤용)
```typescript
// 커서 기반 페이지네이션 (성능 우수)
export interface CursorPaginationOptions {
  cursor?: string // 마지막 아이템의 ID 또는 timestamp
  limit?: number
  direction?: 'next' | 'prev'
}

export async function cursorPaginatedQuery<T>(
  baseQuery: any,
  options: CursorPaginationOptions,
  cursorField = 'created_at'
): Promise<{ data: T[], nextCursor?: string, hasMore: boolean }> {
  const { cursor, limit = 20, direction = 'next' } = options

  let query = baseQuery.limit(limit + 1) // +1로 hasMore 체크

  if (cursor) {
    if (direction === 'next') {
      query = query.lt(cursorField, cursor)
    } else {
      query = query.gt(cursorField, cursor)
    }
  }

  const { data, error } = await query

  if (error) throw error

  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, limit) : data
  const nextCursor = hasMore && items.length > 0 
    ? items[items.length - 1][cursorField] 
    : undefined

  return {
    data: items,
    nextCursor,
    hasMore
  }
}
```

---

## 📁 파일 업로드

### 이미지 업로드 API
```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies: () => request.cookies })
  
  try {
    // 인증 확인
    const { user, error: authError } = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '로그인이 필요합니다.'
        }
      }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_FILE',
          message: '파일을 선택해주세요.'
        }
      }, { status: 400 })
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: '파일 크기는 5MB를 초과할 수 없습니다.'
        }
      }, { status: 400 })
    }

    // 파일 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'JPEG, PNG, WebP 파일만 업로드 가능합니다.'
        }
      }, { status: 400 })
    }

    // 고유 파일명 생성
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw new APIError('UPLOAD_FAILED', '파일 업로드에 실패했습니다.', 500, uploadError)
    }

    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      data: {
        filename: fileName,
        url: publicUrl,
        size: file.size,
        type: file.type
      },
      message: '파일이 성공적으로 업로드되었습니다.'
    })

  } catch (error) {
    return createErrorResponse(error)
  }
}
```

---

## ⚡ 실시간 API

### Server-Sent Events (SSE)
```typescript
// src/app/api/posts/[id]/comments/live/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies: () => request.cookies })

  // SSE 헤더 설정
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  })

  const stream = new ReadableStream({
    start(controller) {
      // Supabase Realtime 구독
      const channel = supabase
        .channel(`post-${params.id}-comments`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${params.id}`
        }, (payload) => {
          const data = `data: ${JSON.stringify(payload.new)}\n\n`
          controller.enqueue(new TextEncoder().encode(data))
        })
        .subscribe()

      // 연결 유지를 위한 heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(new TextEncoder().encode('data: {"type":"heartbeat"}\n\n'))
      }, 30000)

      // 정리 함수
      return () => {
        clearInterval(heartbeat)
        channel.unsubscribe()
      }
    }
  })

  return new Response(stream, { headers })
}
```

---

## 🧪 API 테스팅

### API 클라이언트 함수
```typescript
// lib/api/client.ts
class APIClient {
  private baseURL: string

  constructor(baseURL = '/api') {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data: APIResponse<T> = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'API 요청 실패')
    }

    return data
  }

  // Posts API
  async getPosts(params?: { 
    category?: string 
    limit?: number 
    offset?: number 
  }) {
    const searchParams = new URLSearchParams(params as any)
    return this.request<PostWithDetails[]>(`/posts?${searchParams}`)
  }

  async createPost(data: PostCreateRequest) {
    return this.request<PostWithDetails>('/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async likePost(postId: string) {
    return this.request<{ liked: boolean, like_count: number }>(`/posts/${postId}/like`, {
      method: 'POST'
    })
  }

  // Upload API
  async uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.request<{ url: string, filename: string }>('/upload', {
      method: 'POST',
      body: formData,
      headers: {} // FormData는 Content-Type 자동 설정
    })
  }
}

export const apiClient = new APIClient()
```

### API 테스트 유틸리티
```typescript
// __tests__/api/posts.test.ts
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/posts/route'

// 테스트용 요청 생성 헬퍼
function createTestRequest(url: string, options: RequestInit = {}) {
  return new NextRequest(`http://localhost${url}`, options)
}

describe('/api/posts', () => {
  describe('GET', () => {
    it('should return posts list', async () => {
      const request = createTestRequest('/api/posts')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.meta).toBeDefined()
    })

    it('should filter by category', async () => {
      const request = createTestRequest('/api/posts?category=expecting')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      data.data.forEach((post: any) => {
        expect(post.category).toBe('expecting')
      })
    })
  })

  describe('POST', () => {
    it('should create new post', async () => {
      const postData = {
        title: '테스트 게시글',
        content: '테스트 내용',
        category: 'community'
      }

      const request = createTestRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe(postData.title)
    })

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        title: '', // 빈 제목
        content: 'test'
      }

      const request = createTestRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error?.code).toBe('VALIDATION_ERROR')
    })
  })
})
```

---

**📝 마지막 업데이트**: 2025-09-13  
**🔄 다음 리뷰 예정**: 2025-10-13  
**📖 관련 문서**: [CLAUDE.md](./CLAUDE.md) | [claude-development.md](./claude-development.md) | [claude-database.md](./claude-database.md)