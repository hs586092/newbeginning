# CLAUDE Development Guide - NewBeginning

> 💡 **이 문서는 매일 참조해야 할 핵심 규칙만 포함합니다**  
> 상세 구현은 관련 문서를 참조하세요.

---

## 🎯 이 문서 사용법

- **시작할 때**: 이 문서만 읽어도 기본 개발 가능
- **개발 중**: 필수 규칙과 패턴 빠른 참조
- **상세 작업**: 아래 문서들 추가 참조

## 📚 문서 체계

| 문서 | 용도 | 참조 빈도 |
|------|------|----------|
| **CLAUDE.md** | 매일 사용하는 핵심 규칙 | 매일 |
| [claude-development.md](./claude-development.md) | 컴포넌트, Hooks, State 관리 | 자주 |
| [claude-api.md](./claude-api.md) | API 설계 및 응답 포맷 | API 작업시 |
| [claude-database.md](./claude-database.md) | Supabase 패턴, RPC 함수 | DB 작업시 |
| [claude-testing.md](./claude-testing.md) | 테스트 전략, E2E 가이드 | 테스트 작성시 |
| [claude-security.md](./claude-security.md) | 인증/인가, 보안 패턴 | 보안 작업시 |
| [claude-deployment.md](./claude-deployment.md) | 배포, 환경변수, CI/CD | 배포시 |
| [claude-performance.md](./claude-performance.md) | 최적화, 캐싱, 이미지 | 성능 개선시 |
| [claude-troubleshooting.md](./claude-troubleshooting.md) | 자주 발생하는 문제 해결 | 문제 발생시 |

---

## 🚀 프로젝트 개요

**NewBeginning**: 임신/육아 커뮤니티 플랫폼
- **스택**: Next.js 15.5.2, React 19, Supabase, TypeScript
- **도메인**: 임신 준비 → 출산 → 육아의 연속적인 여정 지원

---

## ⚡ 핵심 아키텍처 원칙

### 1. **사용자 중심 설계** 👥
- 임산부/부모의 급변하는 요구사항 대응
- 접근성 우선 (WCAG 2.1 AA)
- 모바일 우선 반응형

### 2. **타입 안전성** 🔒
```typescript
// ✅ 좋은 예: 엄격한 타입 정의
interface PostCreateRequest {
  title: string
  content: string
  category: 'expecting' | 'newborn' | 'toddler'
  baby_month?: number
}

// ❌ 나쁜 예: any 타입 사용
const createPost = (data: any) => { ... }
```

### 3. **예측 가능한 상태 관리** 📊
- Context + useReducer 패턴
- Optimistic Updates로 즉각적인 UI 반응

### 4. **단순함 우선** ✨
- 복잡한 것보다 이해하기 쉬운 코드
- 과도한 추상화 지양

### 5. **안전한 실패** 🛡️
- 모든 에러는 사용자 친화적 메시지로 처리
- Loading/Error 상태 명확히 표시

---

## 📋 매일 따라야 할 필수 규칙

### ✅ UUID 검증 (필수!)
```typescript
// ✅ 모든 UUID는 반드시 검증
import { isValidUUID } from '@/lib/utils'

const handleUserAction = (userId: string) => {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format')
  }
  // 로직 실행
}

// ✅ 유틸 함수
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
```

### 🎯 에러 처리 패턴
```typescript
// ✅ 표준 에러 처리
interface ApiError {
  code: string
  message: string
  details?: any
}

const useApiCall = () => {
  const [error, setError] = useState<ApiError | null>(null)
  
  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setError({ code: 'UNKNOWN_ERROR', message: err.message })
    } else {
      setError({ code: 'SYSTEM_ERROR', message: '시스템 오류가 발생했습니다.' })
    }
  }
}
```

### 🏷️ 명명 규칙
```typescript
// ✅ 파일명: kebab-case
// post-detail.tsx, user-profile-card.tsx

// ✅ 컴포넌트: PascalCase
const PostDetailCard = () => { ... }

// ✅ 함수/변수: camelCase
const handleSubmit = () => { ... }
const isLoading = true

// ✅ 상수: UPPER_SNAKE_CASE
const MAX_POST_LENGTH = 1000
const API_ENDPOINTS = {
  POSTS: '/api/posts',
  USERS: '/api/users'
}

// ✅ 타입/인터페이스: PascalCase
interface UserProfile { ... }
type PostCategory = 'expecting' | 'newborn'
```

### 📦 Import 순서
```typescript
// ✅ 올바른 import 순서
// 1. React/Next.js
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. 외부 라이브러리
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

// 3. 내부 컴포넌트 (절대경로)
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/post/post-card'

// 4. 타입
import type { Database } from '@/types/database.types'
import type { PostWithDetails } from '@/types/post.types'

// 5. 유틸/상수
import { cn } from '@/lib/utils'
import { POST_CATEGORIES } from '@/constants/post'
```

---

## 🚀 자주 쓰는 코드 패턴

### 🎣 Custom Hook 패턴
```typescript
// ✅ 표준 Custom Hook 구조
export function usePostActions() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const createPost = async (data: PostCreateRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await api.posts.create(data)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성 실패')
      throw err
    } finally {
      setIsLoading(false)
    }
  }
  
  return { createPost, isLoading, error }
}
```

### 🔄 Optimistic Update 패턴
```typescript
// ✅ 낙관적 업데이트
const useLikePost = () => {
  const [optimisticLikes, setOptimisticLikes] = useState<Record<string, boolean>>({})
  
  const toggleLike = async (postId: string, currentLiked: boolean) => {
    // 즉시 UI 업데이트
    setOptimisticLikes(prev => ({ 
      ...prev, 
      [postId]: !currentLiked 
    }))
    
    try {
      await api.posts.toggleLike(postId)
    } catch (error) {
      // 실패시 롤백
      setOptimisticLikes(prev => ({ 
        ...prev, 
        [postId]: currentLiked 
      }))
      toast.error('좋아요 처리에 실패했습니다.')
    }
  }
  
  return { toggleLike, optimisticLikes }
}
```

### 🛡️ Error Boundary 패턴
```typescript
// ✅ 표준 Error Boundary
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback
      return <Fallback error={this.state.error!} />
    }

    return this.props.children
  }
}
```

### 🔐 인증 체크 패턴
```typescript
// ✅ 표준 인증 체크
export function useAuthRequired() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])
  
  return { user, isLoading }
}
```

### 📝 Form 처리 패턴
```typescript
// ✅ 표준 Form 처리
const usePostForm = () => {
  const [formData, setFormData] = useState<PostCreateRequest>({
    title: '',
    content: '',
    category: 'community'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = '제목을 입력하세요'
    if (!formData.content.trim()) newErrors.content = '내용을 입력하세요'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    // 제출 로직
  }
  
  return {
    formData,
    setFormData,
    errors,
    handleSubmit,
    isValid: Object.keys(errors).length === 0
  }
}
```

---

## 🚦 개발 체크리스트

### 코드 작성 전
- [ ] 컴포넌트 목적과 책임이 명확한가?
- [ ] 타입이 정확히 정의되어 있는가?
- [ ] 기존 패턴을 재사용할 수 있는가?

### 코드 작성 중
- [ ] UUID 검증을 포함했는가?
- [ ] 에러 처리를 구현했는가?
- [ ] Loading 상태를 처리했는가?
- [ ] 접근성을 고려했는가?

### 코드 작성 후
- [ ] 타입 에러가 없는가?
- [ ] ESLint 경고가 없는가?
- [ ] 수동 테스트를 완료했는가?
- [ ] 문서를 업데이트했는가?

---

## 🔧 빠른 문제 해결

### 자주 발생하는 문제들

1. **"UUID format invalid"**
   ```typescript
   // ✅ 해결: UUID 검증 추가
   if (!isValidUUID(userId)) return
   ```

2. **"Hydration failed"**
   ```typescript
   // ✅ 해결: useEffect로 감싸기
   const [mounted, setMounted] = useState(false)
   useEffect(() => setMounted(true), [])
   if (!mounted) return null
   ```

3. **Supabase RLS 에러**
   ```sql
   -- ✅ 해결: RLS 정책 확인
   SELECT * FROM posts WHERE user_id = auth.uid()
   ```

---

## 📞 도움이 필요할 때

1. **이 문서**: 매일 사용하는 핵심 패턴
2. **관련 문서**: 특정 기능 구현 가이드  
3. **팀 리뷰**: 복잡한 아키텍처 결정
4. **Supabase 문서**: 데이터베이스/인증 문제

---

**📝 마지막 업데이트**: 2025-09-13  
**🔄 다음 리뷰 예정**: 2025-10-13