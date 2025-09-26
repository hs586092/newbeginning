'use client'

import { useState, useEffect } from 'react'
import { useResilientAuth } from '@/contexts/resilient-auth-context'
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
    loading: isLoading,
    initialized,
    currentState,
    getMachineStatus,
    systemStatus
  } = useResilientAuth()
  
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

  // 🔴 Phase 1 수정: Netflix 패턴 - 무조건 300ms 후 콘텐츠 표시
  const [forceShowContent, setForceShowContent] = useState(false)

  useEffect(() => {
    // 📺 Netflix 방식: 무조건 300ms 후 메인 콘텐츠 표시
    const forceShow = setTimeout(() => {
      console.log('🎬 Netflix 패턴 적용 - 인증 상태 무관하게 콘텐츠 표시')
      setForceShowContent(true)
    }, 300)

    // 인증은 백그라운드에서 비동기 처리 (블로킹하지 않음)
    const checkAuth = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const client = await createClient()
        await client.auth.getSession()
        console.log('✅ 백그라운드 인증 체크 완료')
      } catch (error: any) {
        console.log('⚠️ 인증 체크 실패, 익명으로 계속:', error.message)
      }
    }
    checkAuth().catch(console.error)

    return () => clearTimeout(forceShow)
  }, [])

  // Debug logging - CLAUDE.md 규격
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 HybridAuthWrapper State:', {
      currentState,
      initialized,
      isLoading,
      isAuthenticated,
      forceShowContent,
      hasServerAuth: !!serverUser,
      hasClientAuth: isAuthenticated && !!clientUser
    })
  }

  // 🔴 제거됨: useEffect 내부로 이동됨

  // 🔴 Phase 1 수정: OAuth만 로딩 표시, 나머지는 강제 표시
  const isOAuthFlow = currentState === AuthMachineState.OAUTH_CALLBACK ||
                     currentState === AuthMachineState.AUTHENTICATING ||
                     currentState === AuthMachineState.SIGNING_OUT

  // Netflix 패턴: 300ms 후 무조건 콘텐츠 표시 (인증 상태 무관)
  if (!forceShowContent && !isOAuthFlow) {
    // 정적 컨텐츠와 함께 미니멀한 로딩 표시
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 p-8">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-medium text-gray-900">첫돌까지</h2>
            <p className="text-sm text-gray-600">곧 준비됩니다...</p>
          </div>
        </div>
      </div>
    )
  }

  // 🔴 삭제: 더 이상 일반 로딩 화면 없음 (Netflix 패턴)

  // OAuth 플로우만 로딩 표시
  if (isOAuthFlow) {
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