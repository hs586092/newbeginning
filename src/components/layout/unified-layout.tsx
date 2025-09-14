/**
 * 통합 레이아웃 컴포넌트
 * 로그인 상태와 관계없이 일관된 3단 레이아웃 제공
 */

'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { UnifiedLeftSidebar } from '@/components/sidebar/unified-left-sidebar'
import { UnifiedRightSidebar } from '@/components/sidebar/unified-right-sidebar'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UnifiedLayoutProps {
  children: ReactNode
  isAuthenticated: boolean
  user?: SupabaseUser | null
  showLeftSidebar?: boolean
  showRightSidebar?: boolean
  className?: string
}

export function UnifiedLayout({
  children,
  isAuthenticated,
  user,
  showLeftSidebar = true,
  showRightSidebar = true,
  className
}: UnifiedLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50",
      "transition-colors duration-300",
      className
    )}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className={cn(
          "py-6 sm:py-8",
          // 반응형 그리드 레이아웃
          "grid gap-8",
          // 모바일: 메인만
          "grid-cols-1",
          // 태블릿: 왼쪽 사이드바 + 메인
          showLeftSidebar && "lg:grid-cols-[320px_1fr]",
          // 데스크톱: 왼쪽 + 메인 + 오른쪽 사이드바
          (showLeftSidebar && showRightSidebar) && "xl:grid-cols-[320px_1fr_320px]"
        )}>
          
          {/* 왼쪽 사이드바 - 태블릿부터 표시 */}
          {showLeftSidebar && (
            <div className="hidden lg:block order-1">
              <div className="sticky top-6">
                <UnifiedLeftSidebar 
                  isAuthenticated={isAuthenticated} 
                  user={user}
                />
              </div>
            </div>
          )}

          {/* 메인 콘텐츠 영역 */}
          <main className={cn(
            "order-2",
            // 사이드바 없을 때 중앙 정렬
            (!showLeftSidebar && !showRightSidebar) && "max-w-4xl mx-auto"
          )}>
            {children}
          </main>

          {/* 오른쪽 사이드바 - 데스크톱에서만 표시 */}
          {showRightSidebar && (
            <div className="hidden xl:block order-3">
              <div className="sticky top-6">
                <UnifiedRightSidebar 
                  isAuthenticated={isAuthenticated} 
                  user={user}
                />
              </div>
            </div>
          )}

          {/* 모바일 사이드바 토글 버튼 (향후 구현) */}
          {/* TODO: 모바일에서 사이드바 표시/숨김 기능 */}
        </div>

        {/* 모바일 하단 네비게이션 (향후 구현) */}
        {/* TODO: 모바일 친화적 하단 탭 네비게이션 */}
      </div>
    </div>
  )
}

// 특수한 레이아웃 변형들
export function LandingLayout({ 
  children, 
  isAuthenticated, 
  user 
}: Omit<UnifiedLayoutProps, 'showLeftSidebar' | 'showRightSidebar'>) {
  return (
    <UnifiedLayout
      isAuthenticated={isAuthenticated}
      user={user}
      showLeftSidebar={true} // 항상 왼쪽 사이드바 표시
      showRightSidebar={true} // 항상 오른쪽 사이드바 표시
    >
      {children}
    </UnifiedLayout>
  )
}

export function DashboardLayout({ 
  children, 
  isAuthenticated, 
  user 
}: Omit<UnifiedLayoutProps, 'showLeftSidebar' | 'showRightSidebar'>) {
  return (
    <UnifiedLayout
      isAuthenticated={isAuthenticated}
      user={user}
      showLeftSidebar={true} // 항상 양쪽 사이드바
      showRightSidebar={true}
    >
      {children}
    </UnifiedLayout>
  )
}

export function MinimalLayout({ 
  children 
}: { children: ReactNode }) {
  return (
    <UnifiedLayout
      isAuthenticated={false}
      showLeftSidebar={false} // 사이드바 없음
      showRightSidebar={false}
    >
      {children}
    </UnifiedLayout>
  )
}

export default UnifiedLayout