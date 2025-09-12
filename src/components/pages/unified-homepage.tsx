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
import { createClient } from '@/lib/supabase/client'

interface UnifiedHomepageProps {
  user?: SupabaseUser | null
  isAuthenticated?: boolean
  searchParams?: { [key: string]: string | undefined }
}

// 실제 API 데이터 타입 정의
interface PostAuthor {
  id: string
  username: string
  avatar_url?: string
  baby_birth_date?: string
  baby_name?: string
  is_pregnant?: boolean
  pregnancy_week?: number
}

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
  const [posts, setPosts] = useState<any[]>([]) // 실제 API 데이터 타입으로 변경
  const [isLoading, setIsLoading] = useState(true) // 로딩을 true로 시작
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  // 실제 API에서 게시물 데이터 로드
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        
        const { data: postsData, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
          
        if (postsData && !error && postsData.length > 0) {
          // Transform database posts to match our Post interface
          const transformedPosts = postsData.map((post: any) => ({
            id: post.id,
            content: post.content || post.title || '내용을 불러올 수 없습니다',
            category_id: post.category || 'community',
            category_name: post.category === 'community' ? '커뮤니티' : 
                           post.category === 'expecting' ? '예비양육자' :
                           post.category === 'newborn' ? '신생아 양육자' :
                           post.category === 'toddler' ? '성장기 양육자' :
                           post.category === 'expert' ? '선배 양육자' : '커뮤니티',
            category_icon: post.category === 'community' ? '💬' :
                          post.category === 'expecting' ? '🤰' :
                          post.category === 'newborn' ? '👶' :
                          post.category === 'toddler' ? '🧒' :
                          post.category === 'expert' ? '👩‍👧‍👦' : '📝',
            category_color: 'bg-blue-100',
            hugs: 0,
            views: post.view_count || 0,
            is_question: false,
            tags: [],
            created_at: post.created_at,
            author: {
              id: post.user_id,
              username: post.profiles?.username || post.author_name || '익명',
              avatar_url: post.profiles?.avatar_url
            },
            is_hugged_by_me: false,
            is_bookmarked_by_me: false,
            comments_count: 0
          }))
          
          setPosts(transformedPosts)
        } else {
          // 폴백: 기본 샘플 데이터 사용
          const fallbackPosts = [
            {
              id: 'sample-1',
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
              created_at: new Date().toISOString(),
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
              id: 'sample-2',
              content: '우리 아기가 드디어 뒤집기에 성공했어요! 🎉 5개월 된 지 얼마 안 됐는데 벌써 이런 걸 할 수 있다니 정말 신기해요.',
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
              created_at: new Date(Date.now() - 86400000).toISOString(),
              author: {
                id: 'user2',
                username: '아기사랑맘',
                baby_name: '서준이'
              },
              is_hugged_by_me: true,
              is_bookmarked_by_me: false,
              comments_count: 8
            }
          ]
          setPosts(fallbackPosts)
        }
      } catch (error) {
        console.error('게시물 로딩 실패:', error)
        // 에러 시 빈 배열로 설정
        setPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [supabase])

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
      {isAuthenticated ? (
        /* 인증된 사용자: 기존 구조 유지 */
        <>
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
        </>
      ) : (
        /* 비인증 사용자: 매력적인 랜딩페이지 with 중심 피드 */
        <>
          {/* 매력적인 히어로 섹션 */}
          <div className="relative bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute inset-0">
              <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* 히어로 컨텐츠 */}
            <div className="relative z-10 py-16">
              <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  임신부터 첫돌까지,<br />
                  <span className="text-yellow-300">모든 순간을 함께</span>
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  21개월의 소중한 여정을 혼자 걸어가지 마세요.<br />
                  따뜻한 엄마들의 커뮤니티가 함께합니다.
                </p>
                
                {/* 주요 통계 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">12,500+</div>
                    <div className="text-white/80 text-sm">활성 회원</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">8,230+</div>
                    <div className="text-white/80 text-sm">월 게시글</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">95%</div>
                    <div className="text-white/80 text-sm">만족도</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">24시간</div>
                    <div className="text-white/80 text-sm">실시간 소통</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8">
                      무료로 시작하기
                    </Button>
                  </Link>
                  <Link href="#feed">
                    <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/20 font-semibold px-8">
                      커뮤니티 둘러보기
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div id="feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* 메인 피드 (중심) */}
              <div className="lg:col-span-3 order-2 lg:order-1">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    👶 실시간 양육자들의 이야기
                  </h2>
                  <p className="text-lg text-gray-600">
                    첫돌까지 함께하는 여정 - 소중한 21개월의 여정을 2,847명의 양육자들과 함께 나누고 있어요
                  </p>
                </div>

                {/* 메인 피드 */}
                <UnifiedFeed
                  posts={posts}
                  isLoading={isLoading}
                  isAuthenticated={false}
                  variant="landing"
                  selectedCategory={activeCategory}
                  activeFilter={activeFilter}
                  smartFilter={activeFilter}
                  onAuthRequired={handleAuthRequired}
                />
              </div>

              {/* 사이드바 (매력적인 CTA 및 기능 소개) */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                <div className="sticky top-6 space-y-6">
                  {/* 빠른 회원가입 CTA */}
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-6 text-white">
                    <h3 className="text-lg font-bold mb-2">
                      지금 바로 시작하세요! 🚀
                    </h3>
                    <p className="text-white/90 text-sm mb-4">
                      2분만에 가입하고 12,500명의 양육자들과 함께하세요
                    </p>
                    <Link href="/signup" className="w-full">
                      <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                        무료 회원가입
                      </Button>
                    </Link>
                    <div className="mt-3 text-center">
                      <Link href="/login" className="text-white/80 hover:text-white text-sm underline">
                        이미 회원이신가요?
                      </Link>
                    </div>
                  </div>

                  {/* 주요 기능 */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">✨</span>
                      주요 기능
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="mr-3 text-lg">💬</span>
                        <div>
                          <div className="font-medium text-gray-900">실시간 커뮤니티</div>
                          <div className="text-sm text-gray-600">24시간 언제든 소통</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-3 text-lg">📅</span>
                        <div>
                          <div className="font-medium text-gray-900">주차별 맞춤 정보</div>
                          <div className="text-sm text-gray-600">정확도 95% 의료진 검수</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-3 text-lg">👩‍⚕️</span>
                        <div>
                          <div className="font-medium text-gray-900">전문의 상담</div>
                          <div className="text-sm text-gray-600">평균 답변시간 2시간</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-3 text-lg">📊</span>
                        <div>
                          <div className="font-medium text-gray-900">성장 기록</div>
                          <div className="text-sm text-gray-600">AI 기반 발달 분석</div>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* 사용자 후기 */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center mb-3">
                      <div className="flex text-yellow-400">
                        ⭐⭐⭐⭐⭐
                      </div>
                      <span className="ml-2 text-sm text-gray-600">4.9/5.0</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3 italic">
                      &ldquo;첫 아이라 모든게 걱정이었는데, 여기서 많은 도움을 받았어요. 특히 같은 주차 예비맘들과 이야기하니 마음이 든든해졌습니다.&rdquo;
                    </p>
                    <div className="text-xs text-gray-500">
                      - 29주차 예비맘 김○○님
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 인증된 사용자의 경우 기존 구조 유지 */}
      {isAuthenticated && (
        <MainContainer 
          variant="dashboard"
          showSidebar={true}
        >
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
        </MainContainer>
      )}
    </div>
  )
}

export default UnifiedHomepage