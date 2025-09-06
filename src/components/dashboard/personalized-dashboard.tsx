'use client'

import FeedTabNavigation from '@/components/navigation/feed-tab-navigation'
import { RealtimeProvider } from '@/components/providers/realtime-provider'
import { SearchBar } from '@/components/search/search-bar'
import { SearchFilters } from '@/components/search/search-filters'
import { Button } from '@/components/ui/button'
import type { CommunityCategory } from '@/types/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { PenSquare, Heart } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import SocialFeed from '@/components/social/social-feed'

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
              {/* Sidebar - Complete Landing Page Style */}
              <div className="lg:w-80 space-y-6">
                {/* Personal Stats Card - 소중한 순간들을 함께 기록하고 있어요 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || '엄마'}님의 여정
                  </h3>
                  <div className="text-center text-sm text-gray-600 mb-6">소중한 순간들을 함께 기록하고 있어요</div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-lg">❤️</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">89.2K</div>
                      <div className="text-xs text-gray-600">+15%</div>
                      <div className="text-xs text-gray-500">포근한 응원</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-lg">👥</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">2,847</div>
                      <div className="text-xs text-gray-600">+23%</div>
                      <div className="text-xs text-gray-500">활성 엄마들</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-lg">⭐</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">94%</div>
                      <div className="text-xs text-gray-600">+4%</div>
                      <div className="text-xs text-gray-500">만족도 지수</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-lg">⏰</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">1,234</div>
                      <div className="text-xs text-gray-600">+38%</div>
                      <div className="text-xs text-gray-500">월간 글</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>응원하기</span>
                    </button>
                    <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      <span>⏰</span>
                      <span>신속한 피드</span>
                    </button>
                    <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      <span>🎭</span>
                      <span>커뮤니티 소식</span>
                    </button>
                    <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      <span>📘</span>
                      <span>진료기록</span>
                    </button>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">전문의 상담</h3>
                  <div className="text-sm text-gray-600 mb-4">각 분야별 상담 정보를 보여드려요</div>
                  
                  <div className="space-y-3">
                    {[
                      { name: '임신 정보', icon: '🤰', color: 'purple', count: 342 },
                      { name: '신생아', icon: '👶', color: 'pink', count: 567 },
                      { name: '이유식', icon: '🥄', color: 'green', count: 234 },
                      { name: '수면교육', icon: '😴', color: 'indigo', count: 189 }
                    ].map((category) => (
                      <button
                        key={category.name}
                        onClick={() => setCurrentCategory(category.name)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                          currentCategory === category.name
                            ? 'bg-pink-100 text-pink-700 border border-pink-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">{category.count}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Search Box */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">필요한 정보를 찾는 가장 빠른 방법</h3>
                  <div className="text-sm text-gray-600 mb-4">육아 정보를 찾을 수 있는 가장 스마트한 방법으로 원하는 것을 찾아보세요</div>
                  
                  <div className="space-y-3 mb-4">
                    <SearchBar placeholder="예: 육아용품, 병원, 전문가" />
                    
                    <div className="text-xs text-gray-600">🎯 맞춤 정보 예시:</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                        <span>💝 전용 육아 후기: <span className="text-pink-600">324건 발견</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>🎯 단계별 자료 24건: <span className="text-blue-600">3.2K 공유</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>🏆 맞춤 요청 55건: <span className="text-green-600">15분 평균</span></span>
                      </div>
                    </div>
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

              {/* Main Feed Area - Clean and Simple */}
              <div className="flex-1">
                <SocialFeed
                  selectedCategory={currentCategory}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </RealtimeProvider>
  )
}
