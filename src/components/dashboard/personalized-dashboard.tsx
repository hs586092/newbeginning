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
  const [activeTab, setActiveTab] = useState<string>('all')
  const [currentCategory, setCurrentCategory] = useState<string | undefined>()
  const hasSearchParams = Object.keys(searchParams).length > 0


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
      <div className="min-h-screen bg-white">
        {/* Welcome Hero Section */}
        <section className="bg-gradient-to-br from-pink-400 to-purple-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          {/* Floating Elements - matching landing page */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-2000" />
          
          <div className="relative max-w-7xl mx-auto px-4 py-12">
            <div className="text-center text-white">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-2xl">🤱</span>
                <h1 className="text-3xl md:text-4xl font-bold">
                  안녕하세요, {user.user_metadata?.full_name || user.email?.split('@')[0] || '엄마'}님!
                </h1>
              </div>
              <p className="text-lg md:text-xl text-white/90 mb-6">
                {hasSearchParams ? '검색하신 정보를 찾아드릴게요' : '오늘도 함께하는 소중한 육아 여정이에요 💕'}
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/write">
                  <Button className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-6 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <PenSquare className="w-5 h-5 mr-2" />
                    새 이야기 나누기
                  </Button>
                </Link>
                <div className="w-full sm:w-auto max-w-md">
                  <SearchBar className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder-white/70" placeholder="궁금한 육아 정보를 검색해보세요..." />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Feed Section */}
        <section className="py-16 bg-gradient-to-b from-pink-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4">
            {/* Community Header - matching landing page */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-pink-100 px-4 py-2 rounded-full text-pink-700 font-medium mb-4">
                <span className="text-lg">👥</span>
                <span>나만의 맞춤 피드</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <span className="bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
                  {hasSearchParams ? '찾으시는 정보예요' : '오늘의 따뜻한 이야기들'}
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {hasSearchParams 
                  ? '검색하신 내용과 관련된 엄마들의 경험을 모았어요' 
                  : '엄마들의 실시간 고민과 기쁨을 함께 나누어요'}
              </p>
            </div>

            {/* 피드 네비게이션 (카테고리 탭) */}
            <FeedTabNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
              className="mb-8"
            />

            {/* Sidebar Layout - matching landing page */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Enhanced Sidebar */}
              <div className="lg:w-80 space-y-6">
                <PersonalSidebar user={user} />
                
                {/* Community Welcome Card - matching landing page tone */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">함께하는 육아 여정</h3>
                  <div className="text-center text-sm text-gray-600 mb-6">따뜻한 엄마들과 함께 나누는 이야기</div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-lg">💕</span>
                      </div>
                      <div className="text-sm font-medium text-gray-700">오늘의 포근함</div>
                      <div className="text-xs text-gray-500">함께하는 마음</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-lg">🌟</span>
                      </div>
                      <div className="text-sm font-medium text-gray-700">새로운 발견</div>
                      <div className="text-xs text-gray-500">매일매일 성장</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Link href="/community">
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full">
                        <span className="text-sm">💬 커뮤니티 둘러보기</span>
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Search Filters (when searching) */}
                {hasSearchParams && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">검색 필터</h3>
                    <SearchFilters />
                  </div>
                )}
              </div>

              {/* Main Feed Area */}
              <div className="flex-1">
                {/* Development component temporarily disabled due to API issues */}
                {false && process.env.NODE_ENV === 'development' && (
                  <div className="mb-6">
                    <RealtimeTest />
                  </div>
                )}

                {/* Feed Content with warm styling */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {hasSearchParams ? '검색 결과' : '따뜻한 이야기들'}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {hasSearchParams 
                          ? '찾으시는 정보와 관련된 게시글이에요'
                          : '실시간으로 업데이트되는 엄마들의 소중한 경험들'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-500">실시간</span>
                    </div>
                  </div>

                  <ClientPostsWrapper searchParams={effectiveSearchParams} currentUserId={user?.id} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </RealtimeProvider>
  )
}
