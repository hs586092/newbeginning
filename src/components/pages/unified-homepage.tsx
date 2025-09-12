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

// 실제 API 데이터 타입 정의 (SocialFeed와 동일)
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

  // 실제 API에서 게시물 데이터 로드 (SocialFeed와 동일한 로직)
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
          /* 비인증 사용자용 랜딩 레이아웃 - 기존 구조 복원 */
          <div className="space-y-8">
            {/* 실시간 커뮤니티 피드 (기존 위치) */}
            <ContentSection
              title="👶 실시간 양육자들의 이야기"
              subtitle="첫돌까지 함께하는 여정 - 소중한 21개월의 여정을 2,847명의 양육자들과 함께 나누고 있어요"
            >
              <UnifiedFeed
                posts={posts} // 전체 게시물 표시
                isLoading={isLoading}
                isAuthenticated={false}
                variant="landing"
                selectedCategory={activeCategory}
                activeFilter={activeFilter}
                smartFilter={activeFilter}
                onAuthRequired={handleAuthRequired}
              />
              
              {/* 회원가입 유도 CTA */}
              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-pink-200 dark:border-pink-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    더 많은 기능을 경험해보세요
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    댓글 작성, 좋아요, 북마크 등 모든 기능을 이용하려면 회원가입을 해주세요!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/signup">
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6">
                        무료 회원가입
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" className="px-6">
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