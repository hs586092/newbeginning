/**
 * 모바일 하단 네비게이션 타입 정의
 * MVP 품질 체크리스트: P0-1 TypeScript 타입 안전성
 */

export interface MobileBottomNavigationProps {
  /** 사용자 인증 상태 - 탭 표시 여부 결정 */
  isAuthenticated: boolean

  /** 현재 활성 탭 */
  activeTab?: string

  /** 각 탭의 뱃지 정보 */
  badges?: {
    notifications?: number
    messages?: number
    bookmarks?: number
  }

  /** 탭 클릭 이벤트 핸들러 */
  onTabClick?: (tab: NavigationTab) => void

  /** 접근성 레이블 */
  'aria-label'?: string

  /** 커스텀 클래스명 */
  className?: string
}

export interface NavigationTab {
  /** 탭 식별자 */
  id: string

  /** 탭 표시명 */
  label: string

  /** 탭 아이콘 컴포넌트 */
  icon: string

  /** 링크 경로 */
  href: string

  /** 인증 필요 여부 */
  requiresAuth: boolean

  /** 뱃지 표시 여부 */
  showBadge?: boolean

  /** 뱃지 개수 */
  badgeCount?: number
}

export interface MobileNavigationState {
  /** 현재 활성 탭 */
  activeTab: string

  /** 뱃지 상태 */
  badges: Record<string, number>

  /** 로딩 상태 */
  isLoading: boolean
}

export interface MobileNavigationContextType {
  state: MobileNavigationState
  updateActiveTab: (tabId: string) => void
  updateBadgeCount: (tabId: string, count: number) => void
  clearBadge: (tabId: string) => void
}

// 기본 탭 설정
export const DEFAULT_NAVIGATION_TABS: NavigationTab[] = [
  {
    id: 'home',
    label: '홈',
    icon: '🏠',
    href: '/',
    requiresAuth: false
  },
  {
    id: 'write',
    label: '작성',
    icon: '✏️',
    href: '/write',
    requiresAuth: true
  },
  {
    id: 'notifications',
    label: '알림',
    icon: '🔔',
    href: '/notifications',
    requiresAuth: true,
    showBadge: true
  },
  {
    id: 'bookmarks',
    label: '북마크',
    icon: '📝',
    href: '/bookmarks',
    requiresAuth: true,
    showBadge: true
  },
  {
    id: 'profile',
    label: '프로필',
    icon: '👤',
    href: '/profile',
    requiresAuth: true
  }
]