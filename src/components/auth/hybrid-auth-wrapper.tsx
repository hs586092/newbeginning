'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import PersonalizedDashboard from '@/components/dashboard/personalized-dashboard'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface HybridAuthWrapperProps {
  serverUser: SupabaseUser | null
  searchParams: { [key: string]: string | undefined }
  fallbackComponent: React.ReactNode
}

/**
 * 하이브리드 인증 래퍼 컴포넌트
 * 서버 사이드 인증 정보와 클라이언트 사이드 인증 상태를 모두 확인하여
 * OAuth 로그인 후 발생하는 동기화 지연 문제를 해결합니다.
 */
export function HybridAuthWrapper({ 
  serverUser, 
  searchParams, 
  fallbackComponent 
}: HybridAuthWrapperProps) {
  const { user: clientUser, isAuthenticated, isLoading, initialized } = useAuth()
  const [showDashboard, setShowDashboard] = useState(false)
  const [effectiveUser, setEffectiveUser] = useState<SupabaseUser | null>(serverUser)
  const [extendedWait, setExtendedWait] = useState(false)
  
  // OAuth 콜백 감지 - URL에 access_token이나 code가 있는지 확인
  const hasAuthCallback = () => {
    if (typeof window === 'undefined') return false
    
    const currentUrl = window.location.href
    const urlParams = new URLSearchParams(window.location.search)
    const hash = window.location.hash
    
    // 일반적인 OAuth 파라미터들
    const hasAccessToken = currentUrl.includes('access_token=') || hash.includes('access_token=')
    const hasCode = currentUrl.includes('code=') || urlParams.has('code')
    const hasType = currentUrl.includes('type=') || urlParams.has('type')
    
    // 카카오 특화 감지
    const hasKakaoState = urlParams.has('state') && currentUrl.includes('kakao')
    const hasOAuthParams = urlParams.has('state') || urlParams.has('session_state')
    
    const detected = hasAccessToken || hasCode || hasType || hasKakaoState || hasOAuthParams
    
    if (detected) {
      console.log('🔍 OAuth callback detected:', {
        hasAccessToken,
        hasCode,
        hasType,
        hasKakaoState,
        hasOAuthParams,
        url: currentUrl,
        hash: hash,
        params: Object.fromEntries(urlParams.entries())
      })
    }
    
    return detected
  }

  useEffect(() => {
    // OAuth 콜백 직후인 경우 더 긴 시간 대기
    if (hasAuthCallback() && !clientUser && !serverUser) {
      console.log('🔄 OAuth callback detected, extending wait time')
      
      // 카카오는 더 긴 처리 시간이 필요할 수 있음
      const isKakaoCallback = window.location.href.includes('kakao') || 
                             window.location.search.includes('state')
      const waitTime = isKakaoCallback ? 5000 : 3000 // 카카오는 5초, 구글은 3초
      
      console.log('⏰ Extended wait time:', { isKakaoCallback, waitTime })
      setExtendedWait(true)
      
      const timer = setTimeout(() => {
        console.log('⏰ Extended wait time expired, checking auth state')
        setExtendedWait(false)
      }, waitTime)
      
      return () => clearTimeout(timer)
    }
  }, [clientUser, serverUser])

  useEffect(() => {
    // Auth Context가 초기화된 후에만 판단
    if (!initialized && !extendedWait) return

    // 인증 상태 결정 로직
    const hasServerAuth = !!serverUser
    const hasClientAuth = isAuthenticated && !!clientUser
    const shouldShowDashboard = hasServerAuth || hasClientAuth

    console.log('🔍 Hybrid Auth State:', {
      hasServerAuth,
      hasClientAuth,
      shouldShowDashboard,
      serverUserId: serverUser?.id,
      clientUserId: clientUser?.id,
      initialized,
      isLoading,
      extendedWait,
      hasCallback: hasAuthCallback()
    })

    setShowDashboard(shouldShowDashboard)
    
    // 유효한 사용자 정보 설정 (클라이언트가 더 최신일 수 있음)
    if (hasClientAuth && clientUser) {
      setEffectiveUser(clientUser)
    } else if (hasServerAuth) {
      setEffectiveUser(serverUser)
    } else {
      setEffectiveUser(null)
    }
  }, [serverUser, clientUser, isAuthenticated, isLoading, initialized, extendedWait])

  // Auth Context 초기화 대기 중 또는 OAuth 콜백 처리 중
  if (!initialized || extendedWait) {
    // 카카오 로그인인지 감지
    const isKakaoLogin = typeof window !== 'undefined' && 
      (window.location.href.includes('kakao') || 
       window.location.search.includes('state'))
    
    const message = extendedWait 
      ? '로그인 처리 중...' 
      : '인증 상태 확인 중...'
    
    const subMessage = extendedWait 
      ? (isKakaoLogin ? '카카오 로그인을 완료하는 중입니다...' : '구글 로그인을 완료하는 중입니다...')
      : '잠시만 기다려 주세요'
    
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">{message}</p>
          <p className="text-sm text-gray-500">{subMessage}</p>
          {extendedWait && isKakaoLogin && (
            <p className="text-xs text-gray-400 max-w-md text-center">
              카카오 로그인은 추가 처리 시간이 필요할 수 있습니다
            </p>
          )}
        </div>
      </div>
    )
  }

  // 로그인된 상태: 개인화된 대시보드 표시
  if (showDashboard && effectiveUser) {
    return (
      <PersonalizedDashboard 
        searchParams={searchParams} 
        user={effectiveUser} 
      />
    )
  }

  // 로그인되지 않은 상태: 폴백 컴포넌트 (랜딩 페이지) 표시
  return <>{fallbackComponent}</>
}