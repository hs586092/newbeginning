import { Suspense } from 'react'
import { getUser } from '@/lib/supabase/server'
import { PostListSkeleton } from '@/components/posts/post-list-skeleton'
import { PostsWrapper } from '@/components/posts/posts-wrapper'
import { RealtimeProvider } from '@/components/providers/realtime-provider'
import { SearchBar } from '@/components/search/search-bar'
import { SearchFilters } from '@/components/search/search-filters'
import { CustomerCentricPage } from '@/components/landing/customer-centric-page'

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

  // 기존 대시보드형 페이지 (로그인 사용자 또는 검색 중)
  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* 컴팩트한 헤더 */}
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {hasSearchParams ? '검색 결과' : '📱 최신 피드'}
            </h1>
            {!hasSearchParams && (
              <p className="text-gray-500 text-sm">
                유용한 정보와 커뮤니티 소식을 만나보세요
              </p>
            )}
          </div>

          {/* 검색 바 - 더 컴팩트 */}
          {hasSearchParams && (
            <div className="mb-4">
              <SearchBar className="max-w-xl mx-auto" />
            </div>
          )}
        </div>

        {/* 메인 피드 영역 - 전체 너비 활용 */}
        <div className="max-w-4xl mx-auto px-4">
          {/* 필터는 검색 시에만 표시 */}
          {hasSearchParams && (
            <div className="mb-4">
              <SearchFilters />
            </div>
          )}

          {/* 메인 콘텐츠 - 시선 집중을 위한 중앙 배치 */}
          <div className="w-full">
            <Suspense fallback={<PostListSkeleton />}>
              <PostsWrapper searchParams={searchParams} currentUserId={user?.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </RealtimeProvider>
  )
}
