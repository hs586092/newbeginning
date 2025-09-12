/**
 * 통합된 홈페이지 컴포넌트
 * 로그인 상태와 무관하게 일관된 UI를 제공하면서 기능은 조건부로 활성화
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainContainer, ContentSection } from '@/components/layout/main-container'
import { UnifiedNavigation } from '@/components/navigation/unified-navigation'
import { UnifiedFeed } from '@/components/feed/unified-feed'
import { HeroSection } from '@/components/landing/hero-section'
import { SocialProof } from '@/components/landing/social-proof'
import { Button } from '@/components/ui/button'
import { PenSquare, Users, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import type { CommunityCategory } from '@/types/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UnifiedHomepageProps {
  user?: SupabaseUser | null
  isAuthenticated?: boolean
  searchParams?: { [key: string]: string | undefined }
}

// 샘플 데이터 (실제로는 API에서 가져와야 함)
const SAMPLE_POSTS = [
  {
    id: '1',
    content: '첫 아이를 임신한 지 20주가 되었어요! 태동을 느낄 수 있어서 너무 신기하고 설레요. 다른 임산부 분들은 언제부터 태동을 느끼셨나요?',
    category_id: 'pregnancy',
    category_name: '임신',
    category_icon: '🤰',
    category_color: 'bg-violet-100',
    baby_month: undefined,
    images: [],
    hugs: 24,
    views: 156,
    is_question: true,
    tags: ['태동', '20주', '임신'],
    created_at: '2024-01-15T10:30:00Z',
    author: {
      id: 'user1',
      username: '예비엄마22',
      is_pregnant: true,
      pregnancy_week: 20
    },
    is_hugged_by_me: false,
    is_bookmarked_by_me: false,
    comments_count: 12
  },
  {
    id: '2',
    content: '우리 아기가 드디어 뒤집기에 성공했어요! 🎉 5개월 된 지 얼마 안 됐는데 벌써 이런 걸 할 수 있다니 정말 신기해요. 성장하는 모습을 보면 매일매일이 감동이에요.',
    category_id: 'infant',
    category_name: '영아',
    category_icon: '🍼',
    category_color: 'bg-blue-100',
    baby_month: 5,
    images: [],
    hugs: 38,
    views: 234,
    is_question: false,
    tags: ['뒤집기', '성장', '5개월'],
    created_at: '2024-01-14T15:45:00Z',
    author: {
      id: 'user2',
      username: '아기사랑맘',
      baby_name: '서준이',
      baby_birth_date: '2023-08-15'
    },
    is_hugged_by_me: true,
    is_bookmarked_by_me: false,
    comments_count: 8
  },
  {
    id: '3',
    content: '신생아 때부터 지금까지 모유수유를 하고 있는데, 요즘 수유량이 줄어든 것 같아서 걱정이에요. 다른 분들은 어떻게 모유량을 늘리셨나요?',
    category_id: 'newborn',
    category_name: '신생아',
    category_icon: '👶',
    category_color: 'bg-pink-100',
    baby_month: 2,
    images: [],
    poll: {
      question: '모유량 늘리는 방법으로 가장 효과적이었던 것은?',
      options: [
        { text: '충분한 수분 섭취', votes: 15 },
        { text: '균형 잡힌 식단', votes: 12 },
        { text: '충분한 휴식', votes: 8 },
        { text: '유축기 사용', votes: 5 }
      ]
    },
    hugs: 19,
    views: 189,
    is_question: true,
    tags: ['모유수유', '신생아', '고민'],
    created_at: '2024-01-13T09:20:00Z',
    author: {
      id: 'user3',
      username: '새내기엄마',
      baby_name: '하은이'
    },
    is_hugged_by_me: false,
    is_bookmarked_by_me: true,
    comments_count: 15
  }
]

const STATS_DATA = [
  { icon: '👥', label: '활성 회원', value: '12,500+', color: 'text-blue-600' },
  { icon: '📝', label: '총 게시글', value: '8,230+', color: 'text-green-600' },
  { icon: '💬', label: '오늘 댓글', value: '340+', color: 'text-purple-600' },
  { icon: '❤️', label: '주간 좋아요', value: '1,820+', color: 'text-pink-600' }
]

export function UnifiedHomepage({
  user,
  isAuthenticated = false,
  searchParams = {}
}: UnifiedHomepageProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<string>('latest')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [posts, setPosts] = useState(SAMPLE_POSTS)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // URL 파라미터에서 초기 상태 설정
  useEffect(() => {
    if (searchParams.category) setActiveCategory(searchParams.category)
    if (searchParams.filter) setActiveFilter(searchParams.filter)
    if (searchParams.tab) setActiveTab(searchParams.tab)
    if (searchParams.q) setSearchQuery(searchParams.q)
  }, [searchParams])

  const handleTabChange = useCallback((tab: string, category?: CommunityCategory) => {
    setActiveTab(tab)
    if (category) {
      setActiveCategory(category)
    }
  }, [])

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category)
  }, [])

  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter)
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleAuthRequired = useCallback(() => {
    // 로그인이 필요한 기능 접근 시 처리
    window.location.href = '/login'
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 로그인하지 않은 사용자에게만 Hero Section 표시 */}
      {!isAuthenticated && (
        <>
          <HeroSection />
          <SocialProof />
        </>
      )}
      
      {/* 통합 네비게이션 */}
      <UnifiedNavigation
        isAuthenticated={isAuthenticated}
        activeTab={activeTab}
        activeCategory={activeCategory}
        activeFilter={activeFilter}
        searchQuery={searchQuery}
        showSearch={isAuthenticated}
        showAdvancedFilters={isAuthenticated}
        resultCount={posts.length}
        onTabChange={handleTabChange}
        onCategoryChange={handleCategoryChange}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAuthRequired={handleAuthRequired}
      />

      <MainContainer 
        variant={isAuthenticated ? 'dashboard' : 'landing'}
        showSidebar={isAuthenticated}
      >
        {isAuthenticated ? (
          /* 인증된 사용자용 대시보드 레이아웃 */
          <div className="space-y-6">
            {/* 대시보드 헤더 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    안녕하세요, {user?.email}님! 👋
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    오늘도 따뜻한 육아 이야기를 나누어요
                  </p>
                </div>
                <Link href="/write">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                    <PenSquare className="w-4 h-4 mr-2" />
                    글쓰기
                  </Button>
                </Link>
              </div>
              
              {/* 커뮤니티 통계 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS_DATA.map((stat, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className={`text-lg font-semibold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 통합 피드 */}
            <UnifiedFeed
              posts={posts}
              isLoading={isLoading}
              isAuthenticated={true}
              currentUserId={user?.id}
              variant="dashboard"
              selectedCategory={activeCategory}
              activeFilter={activeFilter}
              smartFilter={activeFilter}
              showSearch={true}
              showAdvancedFilters={true}
              onAuthRequired={handleAuthRequired}
            />
          </div>
        ) : (
          /* 비인증 사용자용 랜딩 레이아웃 */
          <div className="space-y-8">
            {/* 커뮤니티 소개 섹션 */}
            <ContentSection
              title="따뜻한 육아 커뮤니티"
              subtitle="임신부터 육아까지, 함께 나누는 소중한 경험들"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <div className="text-3xl">🤝</div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">함께 나누어요</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      임신과 육아의 모든 순간을<br />서로 공유하며 함께해요
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl">💡</div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">정보를 교환해요</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      실용적인 육아 노하우와<br />유용한 정보를 나누어요
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl">❤️</div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">서로 응원해요</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      힘든 순간에는 위로를,<br />기쁜 순간에는 축하를 함께해요
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8">
                      회원가입하고 시작하기
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="px-8">
                      로그인
                    </Button>
                  </Link>
                </div>
              </div>
            </ContentSection>

            {/* 인기 게시글 미리보기 */}
            <ContentSection
              title="인기 게시글 미리보기"
              subtitle="로그인하면 더 많은 게시글과 기능을 이용하실 수 있어요"
            >
              <UnifiedFeed
                posts={posts.slice(0, 2)} // 미리보기용으로 2개만 표시
                isLoading={isLoading}
                isAuthenticated={false}
                variant="landing"
                selectedCategory={activeCategory}
                activeFilter={activeFilter}
                smartFilter={activeFilter}
                onAuthRequired={handleAuthRequired}
              />
              
              {/* 더 보기 CTA */}
              <div className="mt-6 text-center">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-dashed border-pink-200 dark:border-pink-800">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    더 많은 게시글과 댓글, 좋아요 기능을 이용하려면 회원가입을 해주세요!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Link href="/signup">
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                        무료 회원가입
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline">
                        이미 회원이신가요?
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </ContentSection>
          </div>
        )}
      </MainContainer>
    </div>
  )
}

export default UnifiedHomepage