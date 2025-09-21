/**
 * 지연 로딩 컴포넌트 정의
 * 코드 분할과 동적 import를 통한 번들 최적화
 */

import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Loading fallback component
const LoadingFallback = () => <LoadingSpinner text="로딩 중..." />

// Search components (heavy)
export const AdvancedSearch = dynamic(
  () => import('@/components/search/advanced-search').then(mod => ({ default: mod.AdvancedSearch })),
  {
    loading: LoadingFallback
  }
)

export const SearchFilters = dynamic(
  () => import('@/components/search/search-filters').then(mod => ({ default: mod.SearchFilters })),
  {
    loading: LoadingFallback
  }
)

// Feed components
export const InfiniteFeed = dynamic(
  () => import('@/components/feed/infinite-feed').then(mod => ({ default: mod.InfiniteFeed })),
  {
    loading: LoadingFallback
  }
)

export const UnifiedFeed = dynamic(
  () => import('@/components/feed/unified-feed').then(mod => ({ default: mod.UnifiedFeed })),
  {
    loading: LoadingFallback
  }
)

// Notification system (heavy)
export const RealtimeNotificationSystem = dynamic(
  () => import('@/components/notifications/realtime-notification-system').then(mod => ({ default: mod.RealtimeNotificationSystem })),
  {
    loading: () => null // No loading UI needed for background service
  }
)

export const NotificationBell = dynamic(
  () => import('@/components/notifications/notification-bell').then(mod => ({ default: mod.NotificationBell })),
  {
    loading: () => null
  }
)

// Navigation components
export const FeedTabNavigation = dynamic(
  () => import('@/components/navigation/feed-tab-navigation').then(mod => ({ default: mod.FeedTabNavigation })),
  {
    loading: LoadingFallback
  }
)

// Enhanced search
export const SearchBarEnhanced = dynamic(
  () => import('@/components/ui/search-bar-enhanced').then(mod => ({ default: mod.SearchBarEnhanced })),
  {
    loading: LoadingFallback
  }
)