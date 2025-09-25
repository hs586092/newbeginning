'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { AuthMachineState } from '@/types/auth-state-machine.types'
import { RealisticHomepage } from '@/components/pages/realistic-homepage'
import { UnifiedRealisticDashboard } from '@/components/pages/unified-realistic-dashboard'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface HybridAuthWrapperProps {
  serverUser: SupabaseUser | null
  searchParams: { [key: string]: string | undefined }
}

/**
 * State-less Presenter Component
 * Single Source of Truth - Auth Context with State Machine
 * No local state management to prevent race conditions
 */
export function HybridAuthWrapper({ 
  serverUser, 
  searchParams
}: HybridAuthWrapperProps) {
  const { 
    user: clientUser, 
    isAuthenticated, 
    isLoading, 
    initialized, 
    currentState,
    getMachineStatus
  } = useAuth()
  
  /**
   * Determine effective user (client takes precedence as it's more current)
   */
  const getEffectiveUser = (): SupabaseUser | null => {
    if (isAuthenticated && clientUser) {
      return clientUser
    }
    if (serverUser) {
      return serverUser
    }
    return null
  }

  /**
   * Determine if dashboard should be shown
   */
  const shouldShowDashboard = (): boolean => {
    const hasClientAuth = isAuthenticated && !!clientUser
    const hasServerAuth = !!serverUser
    return hasClientAuth || hasServerAuth
  }

  // ✅ CLAUDE.md 원칙: 안전한 실패 - 타임아웃과 함께
  const [initTimeout, setInitTimeout] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🕐 Authentication initialization timeout - proceeding with fallback')
      setInitTimeout(true)
    }, 2000) // 2초 타임아웃

    return () => clearTimeout(timer)
  }, [])

  // Debug logging - CLAUDE.md 규격
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 HybridAuthWrapper State:', {
      currentState,
      initialized,
      isLoading,
      isAuthenticated,
      initTimeout,
      hasServerAuth: !!serverUser,
      hasClientAuth: isAuthenticated && !!clientUser
    })
  }

  // ✅ CLAUDE.md 원칙: 안전한 실패 - 2초 후 무조건 렌더링
  // OAuth 중요 상태만 로딩 표시, 나머지는 타임아웃 후 진행
  const shouldShowOAuthLoading = currentState === AuthMachineState.OAUTH_CALLBACK ||
                                currentState === AuthMachineState.AUTHENTICATING ||
                                currentState === AuthMachineState.SIGNING_OUT

  const shouldShowRegularLoading = (isLoading || !initialized) &&
                                  !initTimeout &&
                                  !shouldShowOAuthLoading

  if (shouldShowRegularLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">인증 상태 확인 중...</p>
          <p className="text-sm text-gray-500">잠시만 기다려 주세요</p>
        </div>
      </div>
    )
  }

  if (shouldShowOAuthLoading) {
    const loadingConfig = currentState === AuthMachineState.OAUTH_CALLBACK
      ? {
          message: '로그인 처리 중...',
          subMessage: typeof window !== 'undefined' && window.location.href.includes('kakao')
            ? '카카오 로그인을 완료하는 중입니다...'
            : '구글 로그인을 완료하는 중입니다...'
        }
      : currentState === AuthMachineState.AUTHENTICATING
      ? { message: '로그인 중...', subMessage: '잠시만 기다려 주세요' }
      : { message: '로그아웃 중...', subMessage: '잠시만 기다려 주세요' }

    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">{loadingConfig.message}</p>
          <p className="text-sm text-gray-500">{loadingConfig.subMessage}</p>
        </div>
      </div>
    )
  }

  // 통합된 홈페이지 - 모든 사용자가 동일한 피드를 볼 수 있음
  // 로그인 상태에 관계없이 동일한 컴포넌트 사용, 상호작용만 인증 체크
  const effectiveUser = getEffectiveUser()
  const isUserAuthenticated = shouldShowDashboard()

  // 일관된 피드 표시를 위해 항상 같은 컴포넌트 사용
  return (
    <RealisticHomepage
      searchParams={searchParams}
    />
  )
}