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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {hasSearchParams ? '검색 결과' : '최신 게시글'}
          </h1>
          <p className="text-gray-600 mt-2">
            {hasSearchParams 
              ? '검색 조건에 맞는 게시글을 찾고 있습니다...'
              : '구인구직과 커뮤니티 소식을 확인하세요'
            }
          </p>
        </div>

        {/* 검색 바 */}
        <div className="mb-6">
          <SearchBar className="max-w-2xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 필터 사이드바 */}
          <div className="lg:col-span-1">
            <SearchFilters />
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            <Suspense fallback={<PostListSkeleton />}>
              <PostsWrapper searchParams={searchParams} currentUserId={user?.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </RealtimeProvider>
  )
}
