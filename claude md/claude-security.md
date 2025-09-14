# Security Guide - NewBeginning

> 🎯 **인증/인가, 보안 패턴, 취약점 방어 가이드**

---

## 📚 목차

1. [보안 원칙](#보안-원칙)
2. [인증 시스템](#인증-시스템)
3. [권한 관리](#권한-관리)
4. [데이터 보호](#데이터-보호)
5. [입력 검증](#입력-검증)
6. [API 보안](#api-보안)
7. [클라이언트 보안](#클라이언트-보안)
8. [보안 모니터링](#보안-모니터링)

---

## 🛡️ 보안 원칙

### 기본 보안 원칙
1. **최소 권한 원칙**: 필요한 최소한의 권한만 부여
2. **다층 방어**: 여러 보안 계층으로 중복 보호
3. **실패 시 보안**: 실패 상황에서도 안전한 기본값
4. **입력 불신**: 모든 입력을 검증하고 무해화
5. **암호화 우선**: 민감한 데이터는 항상 암호화

### 보안 체크리스트
```typescript
// ✅ 매일 확인해야 할 보안 체크리스트
const SECURITY_CHECKLIST = [
  'UUID 검증 구현',
  '입력 데이터 검증 및 무해화',
  '인증/권한 확인',
  'HTTPS 강제 사용',
  'SQL 인젝션 방지',
  'XSS 방지',
  'CSRF 토큰 검증',
  '민감한 정보 로깅 금지',
  '에러 메시지에서 정보 노출 방지',
  '보안 헤더 설정'
] as const
```

---

## 🔐 인증 시스템

### Supabase Auth 설정
```typescript
// lib/auth/config.ts
export const AUTH_CONFIG = {
  // 세션 설정
  SESSION_TIMEOUT: 24 * 60 * 60, // 24시간
  REFRESH_THRESHOLD: 60 * 60,    // 1시간 전 자동 갱신
  
  // 비밀번호 정책
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL: true,
  
  // 보안 설정
  ENABLE_MFA: false, // 추후 구현 예정
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15분
} as const

// 비밀번호 강도 검증
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
  score: number
} {
  const errors: string[] = []
  let score = 0

  if (password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`비밀번호는 최소 ${AUTH_CONFIG.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`)
  } else {
    score += 1
  }

  if (AUTH_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('대문자를 포함해야 합니다.')
  } else {
    score += 1
  }

  if (AUTH_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('소문자를 포함해야 합니다.')
  } else {
    score += 1
  }

  if (AUTH_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('숫자를 포함해야 합니다.')
  } else {
    score += 1
  }

  if (AUTH_CONFIG.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('특수문자를 포함해야 합니다.')
  } else {
    score += 1
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.round((score / 5) * 100)
  }
}
```

### 보안 인증 Hook
```typescript
// hooks/useSecureAuth.ts
import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useSecureAuth() {
  const router = useRouter()
  const supabase = createClient()

  // 세션 자동 갱신
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      
      return data.session
    } catch (error) {
      console.error('Session refresh failed:', error)
      router.push('/login?reason=session-expired')
      return null
    }
  }, [router, supabase])

  // 세션 모니터링
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          // 로그아웃 시 민감한 데이터 정리
          localStorage.removeItem('user-preferences')
          sessionStorage.clear()
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully')
        }

        if (event === 'SIGNED_IN') {
          // 로그인 시 보안 검증
          await validateUserSession(session)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const validateUserSession = async (session: any) => {
    // IP 주소 변경 감지 (선택적)
    const currentIP = await getCurrentIP()
    const lastKnownIP = localStorage.getItem('last-known-ip')
    
    if (lastKnownIP && currentIP !== lastKnownIP) {
      console.warn('IP address changed, re-authentication may be required')
      // 필요시 추가 인증 요구
    }
    
    localStorage.setItem('last-known-ip', currentIP)
  }

  return {
    refreshSession
  }
}

// IP 주소 조회 유틸리티
async function getCurrentIP(): Promise<string> {
  try {
    const response = await fetch('/api/utils/ip')
    const data = await response.json()
    return data.ip
  } catch (error) {
    return 'unknown'
  }
}
```

---

## 👮 권한 관리

### 역할 기반 접근 제어 (RBAC)
```typescript
// types/auth.types.ts
export type UserRole = 'user' | 'moderator' | 'admin'
export type Permission = 
  | 'post.create'
  | 'post.edit.own' 
  | 'post.edit.any'
  | 'post.delete.own'
  | 'post.delete.any'
  | 'comment.moderate'
  | 'user.ban'
  | 'admin.access'

export interface RolePermissions {
  [key in UserRole]: Permission[]
}

export const ROLE_PERMISSIONS: RolePermissions = {
  user: [
    'post.create',
    'post.edit.own',
    'post.delete.own'
  ],
  moderator: [
    'post.create',
    'post.edit.own',
    'post.delete.own',
    'comment.moderate',
    'post.delete.any'
  ],
  admin: [
    'post.create',
    'post.edit.own',
    'post.edit.any',
    'post.delete.own',
    'post.delete.any',
    'comment.moderate',
    'user.ban',
    'admin.access'
  ]
}

// 권한 확인 유틸리티
export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission)
}

export function requirePermission(
  userRole: UserRole,
  permission: Permission
): void {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Access denied: missing permission ${permission}`)
  }
}
```

### 권한 확인 미들웨어
```typescript
// lib/auth/permissions.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from './jwt'

export function withPermissions(
  permissions: Permission[],
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // 사용자 인증 확인
      const { user, error } = await getAuthenticatedUser(request)
      
      if (!user) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다.'
          }
        }, { status: 401 })
      }

      // 사용자 역할 조회
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const userRole = profile?.role || 'user'

      // 권한 확인
      const hasRequiredPermissions = permissions.every(permission => 
        hasPermission(userRole, permission)
      )

      if (!hasRequiredPermissions) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '이 작업을 수행할 권한이 없습니다.'
          }
        }, { status: 403 })
      }

      return await handler(request, user)
    } catch (error) {
      console.error('Permission check failed:', error)
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '권한 확인 중 오류가 발생했습니다.'
        }
      }, { status: 500 })
    }
  }
}
```

---

## 🔒 데이터 보호

### 민감한 데이터 암호화
```typescript
// lib/crypto/encryption.ts
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY // 32바이트 키
const ALGORITHM = 'aes-256-gcm'

export class DataEncryption {
  static encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY, iv)
      
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const authTag = cipher.getAuthTag()
      
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
    } catch (error) {
      throw new Error('Encryption failed')
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const [ivHex, authTagHex, encrypted] = encryptedData.split(':')
      
      const iv = Buffer.from(ivHex, 'hex')
      const authTag = Buffer.from(authTagHex, 'hex')
      
      const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY, iv)
      decipher.setAuthTag(authTag)
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      throw new Error('Decryption failed')
    }
  }

  // 개인정보 마스킹
  static maskPersonalInfo(data: any): any {
    const sensitiveFields = ['email', 'phone', 'address', 'birth_date']
    const masked = { ...data }
    
    for (const field of sensitiveFields) {
      if (masked[field]) {
        if (field === 'email') {
          const [local, domain] = masked[field].split('@')
          masked[field] = `${local.slice(0, 2)}***@${domain}`
        } else if (field === 'phone') {
          masked[field] = masked[field].replace(/(\d{3})-(\d{3,4})-(\d{4})/, '$1-****-$3')
        } else {
          masked[field] = '***'
        }
      }
    }
    
    return masked
  }
}
```

### 데이터베이스 암호화
```sql
-- 민감한 필드 암호화를 위한 확장 설치
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 암호화 함수들
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_data, current_setting('app.encryption_key'));
EXCEPTION
  WHEN OTHERS THEN
    RETURN '[DECRYPTION_ERROR]';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 민감한 데이터를 위한 보안 테이블
CREATE TABLE secure_user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  encrypted_phone TEXT, -- 암호화된 전화번호
  encrypted_address TEXT, -- 암호화된 주소
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ✅ 입력 검증

### 포괄적인 입력 검증
```typescript
// lib/validation/security.ts
import DOMPurify from 'isomorphic-dompurify'
import { z } from 'zod'

// XSS 방지를 위한 HTML 무해화
export function sanitizeHTML(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: []
  })
}

// SQL 인젝션 방지를 위한 입력 검증
export function validateSQLInput(input: string): boolean {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(;|--|\/\*|\*\/)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\(/i
  ]
  
  return !sqlInjectionPatterns.some(pattern => pattern.test(input))
}

// 파일 업로드 보안 검증
export function validateFileUpload(file: File): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  
  // 파일 크기 검증
  if (file.size > maxSize) {
    errors.push('파일 크기는 5MB를 초과할 수 없습니다.')
  }
  
  // MIME 타입 검증
  if (!allowedTypes.includes(file.type)) {
    errors.push('허용되지 않는 파일 형식입니다.')
  }
  
  // 파일 확장자 검증
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push('허용되지 않는 파일 확장자입니다.')
  }
  
  // 파일명 검증 (경로 탐지 공격 방지)
  if (file.name.includes('../') || file.name.includes('..\\')) {
    errors.push('잘못된 파일명입니다.')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 사용자 입력 종합 검증
export const secureInputSchemas = {
  postCreate: z.object({
    title: z.string()
      .min(1, '제목을 입력하세요')
      .max(200, '제목은 200자를 초과할 수 없습니다')
      .refine(validateSQLInput, '유효하지 않은 문자가 포함되어 있습니다')
      .transform(sanitizeHTML),
    
    content: z.string()
      .min(1, '내용을 입력하세요')
      .max(5000, '내용은 5000자를 초과할 수 없습니다')
      .refine(validateSQLInput, '유효하지 않은 문자가 포함되어 있습니다')
      .transform(sanitizeHTML),
    
    category: z.enum(['community', 'expecting', 'newborn', 'toddler', 'expert']),
    
    baby_month: z.number()
      .min(0, '개월 수는 0 이상이어야 합니다')
      .max(36, '개월 수는 36을 초과할 수 없습니다')
      .optional()
  }),

  userProfile: z.object({
    username: z.string()
      .min(3, '사용자명은 3자 이상이어야 합니다')
      .max(30, '사용자명은 30자를 초과할 수 없습니다')
      .regex(/^[a-zA-Z0-9_]+$/, '사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다')
      .refine(validateSQLInput, '유효하지 않은 문자가 포함되어 있습니다'),
    
    full_name: z.string()
      .max(100, '이름은 100자를 초과할 수 없습니다')
      .optional()
      .transform(val => val ? sanitizeHTML(val) : val),
    
    location: z.string()
      .max(100, '지역은 100자를 초과할 수 없습니다')
      .optional()
      .transform(val => val ? sanitizeHTML(val) : val)
  })
}
```

---

## 🔐 API 보안

### 보안 헤더 설정
```typescript
// middleware.ts (보안 헤더 추가)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // 보안 헤더 설정
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS (HTTPS 강제)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }

  // CSP (Content Security Policy)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Rate Limiting
```typescript
// lib/security/rate-limit.ts
interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

export class RateLimiter {
  private store: RateLimitStore = {}
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const key = identifier

    // 기존 레코드 확인
    if (this.store[key]) {
      if (now > this.store[key].resetTime) {
        // 윈도우 시간이 지나면 리셋
        this.store[key] = {
          count: 1,
          resetTime: now + this.windowMs
        }
        return true
      } else {
        // 기존 윈도우 내에서 카운트 증가
        this.store[key].count++
        return this.store[key].count <= this.maxRequests
      }
    } else {
      // 새로운 레코드 생성
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs
      }
      return true
    }
  }

  getRemainingRequests(identifier: string): number {
    const record = this.store[identifier]
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests
    }
    return Math.max(0, this.maxRequests - record.count)
  }
}

// 다양한 엔드포인트별 Rate Limiter
export const rateLimiters = {
  api: new RateLimiter(60000, 100),      // 1분에 100개 요청
  auth: new RateLimiter(300000, 5),      // 5분에 5개 로그인 시도
  upload: new RateLimiter(3600000, 10),  // 1시간에 10개 파일 업로드
  search: new RateLimiter(60000, 30)     // 1분에 30개 검색
}

// Rate Limiting 미들웨어
export function withRateLimit(
  limiter: RateLimiter,
  getIdentifier?: (request: NextRequest) => string
) {
  return function(handler: Function) {
    return async (request: NextRequest, ...args: any[]) => {
      const identifier = getIdentifier 
        ? getIdentifier(request)
        : request.ip || 'unknown'

      if (!limiter.isAllowed(identifier)) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
            retryAfter: Math.ceil(limiter.windowMs / 1000)
          }
        }, { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limiter.maxRequests.toString(),
            'X-RateLimit-Remaining': limiter.getRemainingRequests(identifier).toString()
          }
        })
      }

      return handler(request, ...args)
    }
  }
}
```

---

## 🌐 클라이언트 보안

### CSRF 보호
```typescript
// lib/security/csrf.ts
export class CSRFProtection {
  private static TOKEN_HEADER = 'X-CSRF-Token'
  private static TOKEN_COOKIE = 'csrf-token'

  static generateToken(): string {
    return crypto.randomUUID()
  }

  static setToken(response: NextResponse, token: string): void {
    response.cookies.set(this.TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24시간
    })
  }

  static validateToken(request: NextRequest): boolean {
    const headerToken = request.headers.get(this.TOKEN_HEADER)
    const cookieToken = request.cookies.get(this.TOKEN_COOKIE)?.value

    if (!headerToken || !cookieToken) {
      return false
    }

    return headerToken === cookieToken
  }
}

// CSRF 보호 Hook
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // 토큰 요청
    fetch('/api/auth/csrf-token')
      .then(res => res.json())
      .then(data => setToken(data.token))
      .catch(console.error)
  }, [])

  const getAuthHeaders = useCallback(() => {
    return token ? { 'X-CSRF-Token': token } : {}
  }, [token])

  return { token, getAuthHeaders }
}
```

### XSS 방지
```typescript
// lib/security/xss-prevention.ts
export class XSSPrevention {
  // 안전한 innerHTML 대체
  static safeSetHTML(element: Element, html: string): void {
    element.innerHTML = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a'],
      ALLOWED_ATTR: ['href', 'title'],
      ALLOWED_URI_REGEXP: /^https?:\/\//
    })
  }

  // 사용자 입력 이스케이프
  static escapeHTML(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // 안전한 URL 검증
  static isSafeURL(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:', 'mailto:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }
}

// React 컴포넌트에서 안전한 HTML 렌더링
export function SafeHTML({ html, className }: { html: string, className?: string }) {
  const sanitizedHTML = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
      ALLOWED_ATTR: []
    })
  }, [html])

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  )
}
```

---

## 📊 보안 모니터링

### 보안 이벤트 로깅
```typescript
// lib/security/audit-log.ts
export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DATA_ACCESS = 'DATA_ACCESS',
  FILE_UPLOAD = 'FILE_UPLOAD',
  RATE_LIMIT_HIT = 'RATE_LIMIT_HIT'
}

export interface SecurityEvent {
  type: SecurityEventType
  userId?: string
  ip: string
  userAgent: string
  details: Record<string, any>
  timestamp: Date
}

export class SecurityAuditLogger {
  static async log(event: SecurityEvent): Promise<void> {
    try {
      // 데이터베이스에 보안 로그 저장
      await supabase.from('security_audit_logs').insert({
        event_type: event.type,
        user_id: event.userId,
        ip_address: event.ip,
        user_agent: event.userAgent,
        details: event.details,
        created_at: event.timestamp.toISOString()
      })

      // 심각한 보안 이벤트는 실시간 알림
      if (this.isCriticalEvent(event.type)) {
        await this.sendSecurityAlert(event)
      }
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  private static isCriticalEvent(type: SecurityEventType): boolean {
    return [
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      SecurityEventType.PERMISSION_DENIED,
      SecurityEventType.RATE_LIMIT_HIT
    ].includes(type)
  }

  private static async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // 보안 팀에게 알림 발송 (이메일, Slack 등)
    console.warn('SECURITY ALERT:', event)
  }
}

// 보안 이벤트 감지 미들웨어
export function withSecurityLogging(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const startTime = Date.now()
    let response: NextResponse
    
    try {
      response = await handler(request, ...args)
      
      // 성공적인 요청 로깅
      if (response.status >= 200 && response.status < 300) {
        await SecurityAuditLogger.log({
          type: SecurityEventType.DATA_ACCESS,
          ip: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          details: {
            path: request.nextUrl.pathname,
            method: request.method,
            duration: Date.now() - startTime
          },
          timestamp: new Date()
        })
      }
      
      return response
    } catch (error) {
      // 에러 발생 시 보안 로깅
      await SecurityAuditLogger.log({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: {
          path: request.nextUrl.pathname,
          method: request.method,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date()
      })
      
      throw error
    }
  }
}
```

### 실시간 위협 탐지
```typescript
// lib/security/threat-detection.ts
export class ThreatDetector {
  // SQL 인젝션 시도 탐지
  static detectSQLInjection(input: string): boolean {
    const patterns = [
      /(\bunion\s+select)/i,
      /(\bdrop\s+table)/i,
      /(\bselect\s+.*\bfrom)/i,
      /(;\s*--)/,
      /(\bor\s+1\s*=\s*1)/i
    ]
    
    return patterns.some(pattern => pattern.test(input))
  }

  // XSS 시도 탐지
  static detectXSS(input: string): boolean {
    const patterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi
    ]
    
    return patterns.some(pattern => pattern.test(input))
  }

  // 비정상적인 요청 패턴 탐지
  static detectAnomalousRequest(request: NextRequest): boolean {
    const suspiciousPatterns = [
      // Path traversal 시도
      /\.\.\/|\.\.\\|\.\//,
      // 파일 확장자 기반 공격
      /\.(php|jsp|asp|cgi)$/i,
      // 디렉터리 스캔 시도
      /(admin|wp-admin|phpmyadmin)/i
    ]
    
    const path = request.nextUrl.pathname
    return suspiciousPatterns.some(pattern => pattern.test(path))
  }

  // 종합 위협 분석
  static analyzeThreat(request: NextRequest, body?: any): {
    isThreat: boolean
    threatLevel: 'low' | 'medium' | 'high'
    details: string[]
  } {
    const threats: string[] = []
    let threatLevel: 'low' | 'medium' | 'high' = 'low'

    // 요청 패턴 검사
    if (this.detectAnomalousRequest(request)) {
      threats.push('Anomalous request pattern detected')
      threatLevel = 'medium'
    }

    // 요청 본문 검사
    if (body) {
      const bodyStr = JSON.stringify(body)
      
      if (this.detectSQLInjection(bodyStr)) {
        threats.push('SQL injection attempt detected')
        threatLevel = 'high'
      }
      
      if (this.detectXSS(bodyStr)) {
        threats.push('XSS attempt detected')
        threatLevel = 'high'
      }
    }

    return {
      isThreat: threats.length > 0,
      threatLevel,
      details: threats
    }
  }
}
```

---

**📝 마지막 업데이트**: 2025-09-13  
**🔄 다음 리뷰 예정**: 2025-10-13  
**📖 관련 문서**: [CLAUDE.md](./CLAUDE.md) | [claude-api.md](./claude-api.md) | [claude-database.md](./claude-database.md)