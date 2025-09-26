/**
 * 🛡️ Resilient Auth Client (CLAUDE.md Long-term Architecture)
 *
 * Core Principles:
 * - Evidence > assumptions: Test auth state before relying on it
 * - Graceful Degradation: Continue without Realtime if needed
 * - Fail Fast, Fail Explicitly: Clear error boundaries
 * - Automatic Recovery: Self-healing authentication state
 *
 * Long-term Perspective:
 * - Complete isolation of Realtime from core auth flow
 * - Circuit breaker pattern for WebSocket failures
 * - Progressive enhancement approach
 */

import { getSupabaseClient } from '@/lib/supabase/client-factory'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  error: string | null
}

export interface AuthConfig {
  timeouts: {
    initialLoad: number      // 초기 로딩 타임아웃
    sessionCheck: number     // 세션 체크 타임아웃
    profileFetch: number     // 프로필 가져오기 타임아웃
  }
  retries: {
    maxAttempts: number      // 최대 재시도 횟수
    backoffMs: number        // 백오프 시간
  }
  features: {
    enableRealtime: boolean  // Realtime 기능 활성화 여부
    enableProfile: boolean   // 프로필 가져오기 활성화 여부
    debugMode: boolean       // 디버그 모드
  }
}

const DEFAULT_CONFIG: AuthConfig = {
  timeouts: {
    initialLoad: 3000,       // 3초
    sessionCheck: 2000,      // 2초
    profileFetch: 1500,      // 1.5초
  },
  retries: {
    maxAttempts: 2,
    backoffMs: 1000,
  },
  features: {
    enableRealtime: false,   // 🔄 Realtime 기본 비활성화 (Long-term stability)
    enableProfile: true,
    debugMode: process.env.NODE_ENV === 'development'
  }
}

export class ResilientAuthClient {
  private config: AuthConfig
  private circuitBreakerOpen = false
  private failureCount = 0
  private lastFailureTime = 0

  constructor(config: Partial<AuthConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.log('🛡️ ResilientAuthClient initialized', { config: this.config })
  }

  private log(message: string, data?: any) {
    if (this.config.features.debugMode) {
      console.log(message, data || '')
    }
  }

  /**
   * ✅ Centralized client: Use factory pattern for all auth operations
   */
  private async getSupabaseClient() {
    this.log('🚀 Getting Supabase client from centralized factory')
    return await getSupabaseClient()
  }

  /**
   * 🔄 Circuit Breaker Pattern
   * WebSocket 실패가 반복되면 회로를 열어서 더 이상 시도하지 않음
   */
  private shouldSkipRealtimeOperations(): boolean {
    if (!this.config.features.enableRealtime) {
      this.log('📡 Realtime disabled by config')
      return true
    }

    if (this.circuitBreakerOpen) {
      // 5분 후 다시 시도
      const cooldownMs = 5 * 60 * 1000
      if (Date.now() - this.lastFailureTime > cooldownMs) {
        this.log('🔄 Circuit breaker cooldown expired, retrying')
        this.circuitBreakerOpen = false
        this.failureCount = 0
        return false
      }
      this.log('⚡ Circuit breaker open - skipping realtime operations')
      return true
    }

    return false
  }

  private recordFailure(operation: string, error: any) {
    this.failureCount++
    this.lastFailureTime = Date.now()

    this.log(`❌ ${operation} failure ${this.failureCount}/${this.config.retries.maxAttempts}`, error.message)

    // 실패 횟수가 임계값을 넘으면 회로 열기
    if (this.failureCount >= this.config.retries.maxAttempts) {
      this.circuitBreakerOpen = true
      this.log('🚨 Circuit breaker opened - Realtime operations disabled')
    }
  }

  /**
   * 🎯 핵심 인증 상태 확인 (Realtime 독립적)
   * Long-term: WebSocket과 완전히 분리된 신뢰할 수 있는 인증 확인
   */
  async getAuthState(): Promise<AuthState> {
    const startTime = Date.now()
    this.log('🔍 Starting resilient auth state check')

    try {
      // Promise with timeout pattern
      const supabase = await this.getSupabaseClient()
      const authPromise = supabase.auth.getSession()

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Auth state check timeout after ${this.config.timeouts.sessionCheck}ms`))
        }, this.config.timeouts.sessionCheck)
      })

      const { data: { session }, error } = await Promise.race([
        authPromise,
        timeoutPromise
      ])

      const duration = Date.now() - startTime

      if (error) {
        this.log('❌ Auth state check failed', { error: error.message, duration })
        return {
          user: null,
          session: null,
          loading: false,
          initialized: true,
          error: error.message
        }
      }

      this.log('✅ Auth state check successful', {
        hasSession: !!session,
        hasUser: !!session?.user,
        duration: `${duration}ms`
      })

      return {
        user: session?.user || null,
        session: session || null,
        loading: false,
        initialized: true,
        error: null
      }

    } catch (error: any) {
      const duration = Date.now() - startTime
      this.log('❌ Auth state check exception', { error: error.message, duration })

      // Realtime 관련 실패는 기록하지만 인증 상태엔 영향 없음
      if (error.message.includes('WebSocket') || error.message.includes('realtime')) {
        this.recordFailure('Auth WebSocket', error)

        // WebSocket 실패여도 인증 상태는 확인 가능
        try {
          const supabase = await this.getSupabaseClient()
          const { data: { session } } = await supabase.auth.getSession()
          return {
            user: session?.user || null,
            session: session || null,
            loading: false,
            initialized: true,
            error: null  // WebSocket 오류는 사용자에게 노출하지 않음
          }
        } catch (fallbackError: any) {
          this.log('❌ Fallback auth check also failed', fallbackError.message)
        }
      }

      return {
        user: null,
        session: null,
        loading: false,
        initialized: true,
        error: 'Authentication service temporarily unavailable'
      }
    }
  }

  /**
   * 🔐 Auth State Change Listener (Resilient)
   * Long-term: WebSocket 실패가 auth state change 리스너에 영향주지 않도록 격리
   */
  async onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    try {
      // Realtime이 비활성화된 경우 폴링 기반으로 대체
      if (this.shouldSkipRealtimeOperations()) {
        this.log('🔄 Using polling-based auth state monitoring')
        return this.startPollingAuthStateMonitor(callback)
      }

      this.log('📡 Setting up Realtime auth state change listener')

      const supabase = await this.getSupabaseClient()
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          this.log('📡 Auth state change via Realtime', { event, hasUser: !!session?.user })
          callback(session?.user || null, session)
        }
      )

      return subscription

    } catch (error: any) {
      this.log('❌ Auth state change listener setup failed', error.message)
      this.recordFailure('Auth State Listener', error)

      // Fallback to polling
      this.log('🔄 Falling back to polling-based auth monitoring')
      return this.startPollingAuthStateMonitor(callback)
    }
  }

  /**
   * 📊 폴링 기반 Auth State 모니터링 (Realtime 대체)
   * Long-term: WebSocket 없이도 auth state 변화 감지
   */
  private startPollingAuthStateMonitor(callback: (user: User | null, session: Session | null) => void) {
    let lastSessionId: string | null = null

    const pollInterval = setInterval(async () => {
      try {
        const supabase = await this.getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()

        // 세션 변화가 있을 때만 콜백 호출
        const currentSessionId = session?.access_token || null
        if (currentSessionId !== lastSessionId) {
          this.log('🔄 Auth state change detected via polling', { hasUser: !!session?.user })
          callback(session?.user || null, session)
          lastSessionId = currentSessionId
        }

      } catch (error: any) {
        this.log('❌ Auth state polling error', error.message)
      }
    }, 5000) // 5초마다 체크

    // Cleanup 함수 반환
    return {
      unsubscribe: () => {
        clearInterval(pollInterval)
        this.log('🧹 Auth state polling stopped')
      }
    }
  }

  /**
   * 🚀 Progressive Enhancement: Realtime 기능을 단계적으로 활성화
   * Long-term: 기본 기능이 안정적으로 작동한 후에만 고급 기능 추가
   */
  async enableProgressiveFeatures() {
    // 기본 인증이 안정적으로 작동하는지 확인
    const authState = await this.getAuthState()

    if (!authState.initialized || authState.error) {
      this.log('⚠️ Basic auth not stable - keeping advanced features disabled')
      return
    }

    // Circuit breaker가 열려있으면 고급 기능 비활성화 유지
    if (this.circuitBreakerOpen) {
      this.log('⚠️ Circuit breaker open - keeping advanced features disabled')
      return
    }

    // 점진적으로 고급 기능 활성화
    this.log('🚀 Basic auth stable - enabling progressive features')
    this.config.features.enableRealtime = true
  }

  /**
   * 📊 시스템 상태 정보
   */
  getSystemStatus() {
    return {
      initialized: true,
      circuitBreakerOpen: this.circuitBreakerOpen,
      failureCount: this.failureCount,
      realtimeEnabled: this.config.features.enableRealtime,
      lastFailureTime: this.lastFailureTime
    }
  }
}

// 싱글톤 인스턴스 (Long-term stability)
export const resilientAuth = new ResilientAuthClient()