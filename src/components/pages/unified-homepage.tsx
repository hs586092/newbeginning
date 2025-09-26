/**
 * 통합된 홈페이지 컴포넌트
 * 로그인 상태와 무관하게 일관된 UI를 제공하면서 기능은 조건부로 활성화
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { LandingLayout } from '@/components/layout/unified-layout'
import dynamic from 'next/dynamic'

// 중요하지 않은 컴포넌트들을 지연 로딩
const UnifiedNavigation = dynamic(() => import('@/components/navigation/unified-navigation').then(mod => ({default: mod.UnifiedNavigation})), {
  loading: () => <div className="h-16 bg-gray-50 animate-pulse rounded-md mb-4" />
})
const UnifiedFeed = dynamic(() => import('@/components/feed/unified-feed').then(mod => ({default: mod.UnifiedFeed})), {
  loading: () => <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-lg" />)}</div>
})
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PenSquare } from 'lucide-react'
import Link from 'next/link'
import type { CommunityCategory } from '@/types/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/simple-auth-context'

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
  searchParams = {}
}: Omit<UnifiedHomepageProps, 'user' | 'isAuthenticated'>) {
  // Use AuthContext for real authentication state
  const { user, isAuthenticated } = useAuth()
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
    <LandingLayout isAuthenticated={isAuthenticated} user={user}>
      {/* 통합 네비게이션 - 모든 사용자에게 표시 */}
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

      {/* 히어로 섹션 - 모든 사용자에게 동일하게 표시 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 mb-8 rounded-xl overflow-hidden">
        <div className="py-12">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              임신부터 첫돌까지, 모든 순간을 함께
            </h1>
            <p className="text-lg text-blue-100 mb-6 max-w-xl mx-auto">
              {isAuthenticated 
                ? `${user?.email}님과 함께하는 따뜻한 양육자들의 커뮤니티`
                : "따뜻한 양육자들의 커뮤니티에서 소중한 경험을 나누세요"
              }
            </p>
            
            <div className="flex justify-center">
              {isAuthenticated ? (
                <Link href="/write">
                  <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                    <PenSquare className="w-4 h-4 mr-2" />
                    새 글 작성하기
                  </Button>
                </Link>
              ) : (
                <Link href="/signup">
                  <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                    무료로 시작하기
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 피드 섹션 */}
      <div className="space-y-6">
        {!isAuthenticated && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              👶 실시간 양육자들의 이야기
            </h2>
            <p className="text-lg text-gray-600">
              첫돌까지 함께하는 여정 - 소중한 21개월의 여정을 2,847명의 양육자들과 함께 나누고 있어요
            </p>
          </div>
        )}

        {/* 통합 피드 */}
        <UnifiedFeed
          posts={posts}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
          currentUserId={user?.id}
          variant={isAuthenticated ? "dashboard" : "landing"}
          selectedCategory={activeCategory}
          activeFilter={activeFilter}
          smartFilter={activeFilter}
          showSearch={isAuthenticated}
          showAdvancedFilters={isAuthenticated}
          onAuthRequired={handleAuthRequired}
        />
      </div>
    </LandingLayout>
  )
}

export default UnifiedHomepage