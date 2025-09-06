'use client'

import FeedTabNavigation from '@/components/navigation/feed-tab-navigation'
import { RealtimeProvider } from '@/components/providers/realtime-provider'
import { SearchBar } from '@/components/search/search-bar'
import { SearchFilters } from '@/components/search/search-filters'
import PersonalSidebar from '@/components/sidebar/personal-sidebar'
import { RealtimeTest } from '@/components/test/realtime-test'
import { Button } from '@/components/ui/button'
import type { CommunityCategory } from '@/types/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { PenSquare } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import ClientPostsWrapper from './client-posts-wrapper'

interface PersonalizedDashboardProps {
  searchParams: { [key: string]: string | undefined }
  user: SupabaseUser | null
}

export default function PersonalizedDashboard({ searchParams, user }: PersonalizedDashboardProps) {
  // Safety guard - if no user, show error or redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600 mb-8">개인화된 대시보드를 보려면 먼저 로그인해주세요.</p>
          <Link href="/login">
            <Button>로그인하기</Button>
          </Link>
        </div>
      </div>
    )
  }

  const [activeTab, setActiveTab] = useState<string>('all')
  const [currentCategory, setCurrentCategory] = useState<string | undefined>()
  const hasSearchParams = Object.keys(searchParams).length > 0

  const handleTabChange = (tab: string, category?: CommunityCategory) => {
    setActiveTab(tab)
    if (tab === 'educational') {
      // 정보센터로 이동
      window.location.href = '/educational'
    } else if (category && category !== 'all') {
      setCurrentCategory(category)
    } else {
      setCurrentCategory(undefined)
    }
  }

  // 실제 사용할 검색 파라미터 (탭 필터링 포함)
  const effectiveSearchParams = {
    ...searchParams,
    ...(currentCategory && { category: currentCategory })
  }

  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* 페이지 헤더 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {hasSearchParams ? '🔍 검색 결과' : '📱 내 피드'}
                </h1>
                {!hasSearchParams && (
                  <p className="text-gray-600 mt-1">
                    개인화된 정보와 커뮤니티 소식을 확인하세요
                  </p>
                )}
              </div>

              {/* 빠른 액션 버튼 (모바일용) */}
              <div className="lg:hidden">
                <Link href="/write">
                  <Button size="sm" className="flex items-center gap-2">
                    <PenSquare className="w-4 h-4" />
                    글쓰기
                  </Button>
                </Link>
              </div>
            </div>

            {/* 검색 바 */}
            <div className="mt-4">
              <SearchBar className="max-w-2xl" />
            </div>
          </div>

          {/* 피드 네비게이션 (카테고리 탭) */}
          <FeedTabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            className="mb-6"
          />

          {/* 메인 레이아웃 - 사이드바 + 피드 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 개인화된 사이드바 */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <PersonalSidebar user={user} />
            </div>

            {/* 메인 피드 영역 */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {/* 검색 필터 (검색 시에만 표시) */}
              {hasSearchParams && (
                <div className="mb-6">
                  <SearchFilters />
                </div>
              )}

              {/* Real-time Test Component (for development) */}
              <div className="mb-6">
                <RealtimeTest />
              </div>

              {/* 피드 컨텐츠 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {hasSearchParams ? '검색된 글' : '최신 소식'}
                  </h2>
                  <div className="text-sm text-gray-500">
                    실시간 업데이트
                  </div>
                </div>

                <ClientPostsWrapper searchParams={effectiveSearchParams} currentUserId={user?.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RealtimeProvider>
  )
}
