/**
 * 🛡️ Resilient Auth Context (CLAUDE.md Long-term Solution)
 *
 * Long-term Architecture:
 * - Complete isolation from WebSocket failures
 * - Circuit breaker for Realtime operations
 * - Progressive enhancement approach
 * - Self-healing authentication system
 */

'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { resilientAuth, type AuthState } from '@/lib/auth/resilient-auth-client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  // Core auth state
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  error: string | null

  // System status
  isAuthenticated: boolean
  systemStatus: any

  // Actions
  refreshAuth: () => Promise<void>
  signOut: () => Promise<{ success: boolean; error?: string }>

  // Legacy compatibility (for existing components)
  profile: any
  currentState: string
  isLoading: boolean
  getMachineStatus: () => any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function ResilientAuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
    error: null
  })

  const [systemStatus, setSystemStatus] = useState<any>({})

  // 🎯 핵심 인증 상태 로드 (WebSocket 독립적)
  const loadAuthState = useCallback(async () => {
    console.log('🔄 Loading resilient auth state...')

    try {
      const newAuthState = await resilientAuth.getAuthState()
      const status = resilientAuth.getSystemStatus()

      setAuthState(newAuthState)
      setSystemStatus(status)

      console.log('✅ Resilient auth state loaded', {
        hasUser: !!newAuthState.user,
        initialized: newAuthState.initialized,
        error: newAuthState.error,
        systemStatus: status
      })

    } catch (error: any) {
      console.error('❌ Failed to load resilient auth state:', error)
      setAuthState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
        error: error.message
      })
    }
  }, [])

  // 🔄 Auth state change 리스너 설정 (Resilient)
  useEffect(() => {
    console.log('🔧 Setting up resilient auth state monitoring...')

    let subscription: any

    const setupAuthListener = async () => {
      try {
        // 초기 상태 로드
        await loadAuthState()

        // Auth state change 리스너 설정 (WebSocket 실패해도 폴링으로 대체)
        subscription = resilientAuth.onAuthStateChange((user, session) => {
          console.log('📡 Resilient auth state change', { hasUser: !!user })

          setAuthState({
            user,
            session,
            loading: false,
            initialized: true,
            error: null
          })
        })

        // Progressive enhancement 활성화 (기본 기능이 안정된 후)
        setTimeout(() => {
          resilientAuth.enableProgressiveFeatures()
        }, 1000)

      } catch (error: any) {
        console.error('❌ Auth listener setup failed:', error)
        setAuthState(prev => ({
          ...prev,
          loading: false,
          initialized: true,
          error: 'Authentication system initialization failed'
        }))
      }
    }

    setupAuthListener()

    // Cleanup
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [loadAuthState])

  // 🔄 수동 새로고침
  const refreshAuth = useCallback(async () => {
    console.log('🔄 Manual auth refresh requested')
    await loadAuthState()
  }, [loadAuthState])

  // 🚪 로그아웃
  const signOut = useCallback(async () => {
    console.log('🚪 Resilient sign out')
    try {
      const { getSupabaseClient } = await import('@/lib/supabase/client-factory')
      const supabase = await getSupabaseClient()

      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        return { success: false, error: error.message }
      } else {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          initialized: true,
          error: null
        })
        return { success: true }
      }
    } catch (error: any) {
      console.error('Sign out exception:', error)
      return { success: false, error: error.message || 'Sign out failed' }
    }
  }, [])

  // Context value with legacy compatibility
  const contextValue: AuthContextType = {
    // Core state
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    initialized: authState.initialized,
    error: authState.error,

    // Derived state
    isAuthenticated: !!authState.user,
    systemStatus,

    // Actions
    refreshAuth,
    signOut,

    // Legacy compatibility (for components still using old interface)
    profile: null, // TODO: Implement if needed
    currentState: authState.initialized ? (authState.user ? 'AUTHENTICATED' : 'UNAUTHENTICATED') : 'LOADING',
    isLoading: authState.loading,
    getMachineStatus: () => ({
      state: authState.initialized ? (authState.user ? 'AUTHENTICATED' : 'UNAUTHENTICATED') : 'LOADING',
      ...systemStatus
    })
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useResilientAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useResilientAuth must be used within a ResilientAuthProvider')
  }
  return context
}

// Legacy export for backward compatibility
export const useAuth = useResilientAuth