/**
 * 메인 컨테이너 컴포넌트
 * 로그인 상태와 무관하게 일관된 레이아웃을 제공
 */

'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MainContainerProps {
  children: ReactNode
  variant?: 'landing' | 'dashboard'
  showSidebar?: boolean
  className?: string
}

export function MainContainer({ 
  children, 
  variant = 'landing',
  showSidebar = false,
  className 
}: MainContainerProps) {
  return (
    <main className={cn(
      "min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
      "transition-colors duration-300",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "py-6 sm:py-8",
          showSidebar ? "grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8" : "w-full"
        )}>
          {showSidebar ? (
            <>
              {/* 사이드바 영역 */}
              <aside className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    빠른 액세스
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                      📝 내 게시글
                    </button>
                    <button className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                      ❤️ 좋아요한 글
                    </button>
                    <button className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                      🔖 북마크
                    </button>
                  </div>
                </div>
              </aside>
              
              {/* 메인 콘텐츠 영역 */}
              <div className="lg:col-span-3">
                {children}
              </div>
            </>
          ) : (
            <div className="w-full max-w-4xl mx-auto">
              {children}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

// 섹션별 공통 스타일을 위한 서브 컴포넌트들
interface ContentSectionProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export function ContentSection({ 
  children, 
  title, 
  subtitle, 
  className 
}: ContentSectionProps) {
  return (
    <section className={cn("mb-8", className)}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

// 카드형 콘텐츠 래퍼
interface ContentCardProps {
  children: ReactNode
  className?: string
}

export function ContentCard({ children, className }: ContentCardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700",
      "hover:shadow-md transition-all duration-200",
      className
    )}>
      {children}
    </div>
  )
}