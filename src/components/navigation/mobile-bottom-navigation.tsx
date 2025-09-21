/**
 * 모바일 하단 네비게이션 컴포넌트
 * MVP 품질 체크리스트: 병렬 개발 (기능 + 품질)
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  MobileBottomNavigationProps,
  NavigationTab,
  DEFAULT_NAVIGATION_TABS
} from '@/types/mobile-navigation.types'

export function MobileBottomNavigation({
  isAuthenticated,
  activeTab,
  badges = {},
  onTabClick,
  'aria-label': ariaLabel = '모바일 메인 네비게이션',
  className
}: MobileBottomNavigationProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 현재 경로 기반 활성 탭 결정
  const getCurrentTab = (): string => {
    if (activeTab) return activeTab

    // 경로 기반 자동 감지
    if (pathname === '/') return 'home'
    if (pathname === '/write') return 'write'
    if (pathname.startsWith('/notifications')) return 'notifications'
    if (pathname.startsWith('/bookmarks')) return 'bookmarks'
    if (pathname.startsWith('/profile')) return 'profile'

    return 'home'
  }

  // 모든 탭을 항상 표시 (UX 개선)
  const getVisibleTabs = (): NavigationTab[] => {
    return DEFAULT_NAVIGATION_TABS
  }

  // 탭 클릭 핸들러 (인증 확인 포함)
  const handleTabClick = (tab: NavigationTab, event: React.MouseEvent) => {
    // 인증이 필요한 탭이고 비로그인 상태면 로그인 유도
    if (tab.requiresAuth && !isAuthenticated) {
      event.preventDefault()

      // 사용자 친화적 알림 메시지
      const messages = {
        write: '글을 작성하려면 로그인이 필요합니다.',
        notifications: '알림을 보려면 로그인이 필요합니다.',
        bookmarks: '북마크를 보려면 로그인이 필요합니다.',
        profile: '프로필을 보려면 로그인이 필요합니다.'
      }

      const message = messages[tab.id as keyof typeof messages] || '이 기능을 사용하려면 로그인이 필요합니다.'

      // 취소 버튼 없이 바로 로그인 페이지로 이동
      alert(`${message}\n\n로그인 페이지로 이동합니다.`)
      window.location.href = '/login'
      return
    }

    if (onTabClick) {
      onTabClick(tab)
    }
  }

  // 뱃지 표시 여부 확인 (로그인 상태와 무관하게 표시)
  const getBadgeCount = (tabId: string): number => {
    return badges[tabId] || 0
  }

  // SSR 방지
  if (!mounted) return null

  const visibleTabs = getVisibleTabs()
  const currentTab = getCurrentTab()

  // 디버깅을 위한 로그
  console.log('🔍 MobileBottomNavigation 렌더링', {
    mounted,
    visibleTabs: visibleTabs.length,
    currentTab,
    isAuthenticated
  })

  return (
    <nav
      data-testid="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '8px',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'block'
      }}
      className="md:hidden"
      role="navigation"
      aria-label={ariaLabel}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', maxWidth: '512px', margin: '0 auto' }}>
        {visibleTabs.map((tab) => {
          const isActive = currentTab === tab.id
          const badgeCount = getBadgeCount(tab.id)
          const showBadge = tab.showBadge && badgeCount > 0
          const needsAuth = tab.requiresAuth && !isAuthenticated

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={(e) => handleTabClick(tab, e)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '1',
                padding: '8px',
                fontSize: '12px',
                fontWeight: 500,
                textDecoration: 'none',
                borderRadius: '8px',
                backgroundColor: isActive ? '#dbeafe' : 'transparent',
                color: needsAuth ? '#9ca3af' : (isActive ? '#2563eb' : '#4b5563'),
                opacity: needsAuth ? 0.7 : 1
              }}
              aria-label={`${tab.label} 탭${needsAuth ? ' (로그인 필요)' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* 아이콘 */}
              <div style={{ position: 'relative', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '20px',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.2s',
                    position: 'relative'
                  }}
                  role="img"
                  aria-hidden="true"
                >
                  {tab.icon}
                  {needsAuth && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        fontSize: '8px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '50%',
                        width: '12px',
                        height: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      🔒
                    </span>
                  )}
                </span>

                {/* 뱃지 */}
                {showBadge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-8px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '9px',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </div>

              {/* 라벨 */}
              <span style={{ lineHeight: 1 }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// 컴포넌트 메타데이터 (디버깅용)
MobileBottomNavigation.displayName = 'MobileBottomNavigation'

export default MobileBottomNavigation