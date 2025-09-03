import { Suspense } from 'react'
import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { PostListSkeleton } from '@/components/posts/post-list-skeleton'
import { PostsWrapper } from '@/components/posts/posts-wrapper'
import { RealtimeProvider } from '@/components/providers/realtime-provider'
import { SearchBar } from '@/components/search/search-bar'
import { SearchFilters } from '@/components/search/search-filters'
import { CustomerCentricPage } from '@/components/landing/customer-centric-page'
import PersonalSidebar from '@/components/sidebar/personal-sidebar'
import { Button } from '@/components/ui/button'
import { PenSquare } from 'lucide-react'

interface HomePageProps {
  searchParams: { [key: string]: string | undefined }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { user } = await getUser()
  const hasSearchParams = Object.keys(searchParams).length > 0
  
  // 새 방문자나 검색 파라미터가 없을 때는 Customer-Centric 랜딩페이지 표시
  const showLandingPage = !user && !hasSearchParams

  if (showLandingPage) {
    return <CustomerCentricPage />
  }

  // 로그인 사용자용 개인화된 피드 대시보드
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

          {/* 메인 레이아웃 - 사이드바 + 피드 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 개인화된 사이드바 */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              {user && <PersonalSidebar user={user} />}
            </div>

            {/* 메인 피드 영역 */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {/* 검색 필터 (검색 시에만 표시) */}
              {hasSearchParams && (
                <div className="mb-6">
                  <SearchFilters />
                </div>
              )}

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
                
                <Suspense fallback={<PostListSkeleton />}>
                  <PostsWrapper searchParams={searchParams} currentUserId={user?.id} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RealtimeProvider>
  )
}
