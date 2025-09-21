/**
 * 네비게이션용 에러 바운더리 컴포넌트
 * MVP 품질 체크리스트: P0-5 에러 경계 처리
 */

'use client'

import React, { Component, ReactNode } from 'react'

interface NavigationErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface NavigationErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class NavigationErrorBoundary extends Component<
  NavigationErrorBoundaryProps,
  NavigationErrorBoundaryState
> {
  constructor(props: NavigationErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): NavigationErrorBoundaryState {
    // 에러가 발생하면 상태 업데이트
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅 (실제 환경에서는 모니터링 서비스로 전송)
    console.error('MobileBottomNavigation Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })

    // 개발 환경에서 상세 로그
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Navigation Error Details')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.groupEnd()
    }
  }

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 기본 폴백 UI - 모바일 네비게이션 최소 기능 제공
      return (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-lg block md:hidden"
          role="navigation"
          aria-label="네비게이션 (오류 모드)"
        >
          <div className="flex items-center justify-center max-w-lg mx-auto">
            <div className="text-center py-2">
              <div className="text-gray-500 text-sm mb-1">⚠️</div>
              <div className="text-xs text-gray-600">네비게이션 일시 오류</div>
              <button
                onClick={() => {
                  // 에러 상태 리셋 시도
                  this.setState({ hasError: false, error: null })
                  // 페이지 새로고침으로 복구 시도
                  window.location.reload()
                }}
                className="mt-1 px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </nav>
      )
    }

    return this.props.children
  }
}

// HOC 패턴으로 래퍼 함수 제공
export function withNavigationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => {
    return (
      <NavigationErrorBoundary fallback={fallback}>
        <Component {...props} />
      </NavigationErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withNavigationErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

export default NavigationErrorBoundary