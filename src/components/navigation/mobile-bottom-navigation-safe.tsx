/**
 * 에러 바운더리가 적용된 안전한 모바일 하단 네비게이션
 * MVP 품질 체크리스트: P0-5 에러 경계 처리 + 기능 구현
 */

'use client'

import { NavigationErrorBoundary } from '@/components/error/navigation-error-boundary'
import { MobileBottomNavigation } from './mobile-bottom-navigation'
import type { MobileBottomNavigationProps } from '@/types/mobile-navigation.types'

export function MobileBottomNavigationSafe(props: MobileBottomNavigationProps) {
  return (
    <NavigationErrorBoundary
      fallback={
        // 에러 시 최소한의 홈 버튼만 제공
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-lg block md:hidden"
          role="navigation"
          aria-label="간소화된 네비게이션"
        >
          <div className="flex items-center justify-center">
            <a
              href="/"
              className="flex flex-col items-center justify-center px-4 py-2 text-blue-600 text-xs font-medium"
              aria-label="홈으로 가기"
            >
              <span className="text-xl mb-1" role="img" aria-hidden="true">🏠</span>
              <span>홈</span>
            </a>
          </div>
        </nav>
      }
    >
      <MobileBottomNavigation {...props} />
    </NavigationErrorBoundary>
  )
}

// 기본 내보내기를 안전한 버전으로 설정
export default MobileBottomNavigationSafe