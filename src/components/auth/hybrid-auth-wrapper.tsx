'use client'

import { useAuth } from '@/contexts/auth-context'
import { AuthMachineState } from '@/types/auth-state-machine.types'
import PersonalizedDashboard from '@/components/dashboard/personalized-dashboard'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface HybridAuthWrapperProps {
  serverUser: SupabaseUser | null
  searchParams: { [key: string]: string | undefined }
  fallbackComponent: React.ReactNode
}

/**
 * State-less Presenter Component
 * Single Source of Truth - Auth Context with State Machine
 * No local state management to prevent race conditions
 */
export function HybridAuthWrapper({ 
  serverUser, 
  searchParams, 
  fallbackComponent 
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

  // Debug logging for State Machine status
  if (process.env.NODE_ENV === 'development') {
    const machineStatus = getMachineStatus()
    console.log('🔍 HybridAuthWrapper State:', {
      currentState,
      initialized,
      isLoading,
      isAuthenticated,
      hasServerAuth: !!serverUser,
      hasClientAuth: isAuthenticated && !!clientUser,
      machineStatus
    })
  }

  // Loading states managed by State Machine - Single Source of Truth
  if (isLoading || !initialized) {
    // Get loading configuration from State Machine
    const loadingConfig = currentState === AuthMachineState.INITIALIZING 
      ? { message: '인증 상태 확인 중...', subMessage: '잠시만 기다려 주세요' }
      : currentState === AuthMachineState.OAUTH_CALLBACK 
      ? { 
          message: '로그인 처리 중...', 
          subMessage: typeof window !== 'undefined' && window.location.href.includes('kakao')
            ? '카카오 로그인을 완료하는 중입니다...'
            : '구글 로그인을 완료하는 중입니다...'
        }
      : currentState === AuthMachineState.AUTHENTICATING
      ? { message: '로그인 중...', subMessage: '잠시만 기다려 주세요' }
      : currentState === AuthMachineState.SIGNING_OUT
      ? { message: '로그아웃 중...', subMessage: '잠시만 기다려 주세요' }
      : { message: '처리 중...', subMessage: '잠시만 기다려 주세요' }

    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">{loadingConfig.message}</p>
          <p className="text-sm text-gray-500">{loadingConfig.subMessage}</p>
          {currentState === AuthMachineState.OAUTH_CALLBACK && 
           typeof window !== 'undefined' && 
           window.location.href.includes('kakao') && (
            <p className="text-xs text-gray-400 max-w-md text-center">
              카카오 로그인은 추가 처리 시간이 필요할 수 있습니다
            </p>
          )}
        </div>
      </div>
    )
  }

  // Authenticated state - show dashboard
  const effectiveUser = getEffectiveUser()
  if (shouldShowDashboard() && effectiveUser) {
    return (
      <PersonalizedDashboard 
        searchParams={searchParams} 
        user={effectiveUser} 
      />
    )
  }

  // Unauthenticated state - show fallback component
  return <>{fallbackComponent}</>
}