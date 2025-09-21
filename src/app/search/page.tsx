/**
 * 검색 페이지
 * 고급 검색 기능과 결과 표시
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { AdvancedSearch } from '@/lib/performance/lazy-components'
import { useSearch } from '@/hooks/use-search'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { PostSkeleton } from '@/components/ui/skeleton'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorMessage } from '@/components/ui/error-message'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback, generateInitials } from '@/components/ui/avatar'
import { PostInteractionsV3 } from '@/components/posts/post-interactions-v3'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Filter, TrendingUp, Clock, Baby, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function SearchPage() {
  const searchParams = useSearchParams()

  // Initialize search filters from URL
  const initialFilters = useMemo(() => ({
    query: searchParams.get('q') || '',
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    dateRange: null,
    babyMonth: searchParams.get('babyMonth') ? parseInt(searchParams.get('babyMonth')!) : undefined,
    sortBy: (searchParams.get('sort') as any) || 'relevance',
    postType: (searchParams.get('type') as any) || 'all',
    hasImages: searchParams.get('images') === 'true',
    minLikes: parseInt(searchParams.get('minLikes') || '0')
  }), [searchParams])

  // Use search hook
  const {
    results,
    totalCount,
    searchSuggestions,
    filters,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    updateFilters,
    fetchNextPage,
    refetch,
    clearSearch
  } = useSearch(initialFilters)

  // Infinite scroll
  const { loadMoreRef, isNearEnd } = useInfiniteScroll(
    () => {
      if (!isFetchingNextPage && hasNextPage) {
        fetchNextPage()
      }
    },
    {
      enabled: !isLoading && !isError,
      hasNextPage: !!hasNextPage,
      isFetchingNextPage,
      rootMargin: '200px'
    }
  )

  const hasActiveSearch = filters.query.trim() || filters.categories.length > 0 || filters.tags.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Search className="w-4 h-4 mr-2" />
            🔍 스마트 검색
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              커뮤니티 검색
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            원하는 정보를 빠르게 찾아보세요. 카테고리, 태그, 날짜 등 다양한 필터로 정확한 검색이 가능합니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Search Sidebar */}
          <div className="lg:col-span-1">
            <AdvancedSearch
              onSearch={updateFilters}
              isLoading={isLoading}
              className="sticky top-4"
            />

            {/* Search Suggestions */}
            {searchSuggestions.length > 0 && (
              <Card className="mt-6 p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  검색 제안
                </h3>
                <div className="space-y-2">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => updateFilters({ ...filters, query: suggestion })}
                      className="block w-full text-left px-2 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Status */}
            {hasActiveSearch && (
              <div className="mb-6 p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {totalCount > 0 ? `${totalCount.toLocaleString()}개의 검색 결과` : '검색 결과 없음'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {filters.query && `"${filters.query}"`}
                        {filters.categories.length > 0 && ` · ${filters.categories.length}개 카테고리`}
                        {filters.tags.length > 0 && ` · ${filters.tags.length}개 태그`}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearSearch}>
                    검색 초기화
                  </Button>
                </div>
              </div>
            )}

            {/* Search Results */}
            {!hasActiveSearch ? (
              // Welcome state
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  무엇을 찾고 계신가요?
                </h2>
                <p className="text-gray-500 mb-6">
                  검색어를 입력하거나 필터를 사용해서 원하는 정보를 찾아보세요.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['신생아', '수유', '수면교육', '이유식', '발달'].map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilters({ ...filters, query: term })}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            ) : isLoading ? (
              // Loading state
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              // Error state
              <ErrorMessage
                title="검색 결과를 불러올 수 없습니다"
                message={error?.message || "네트워크 연결을 확인하고 다시 시도해주세요."}
                retry={() => refetch()}
              />
            ) : results.length === 0 ? (
              // Empty results
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-500 mb-4">
                  다른 검색어를 시도하거나 필터를 조정해보세요.
                </p>
                <Button variant="outline" onClick={clearSearch}>
                  필터 초기화
                </Button>
              </div>
            ) : (
              // Results
              <div className="space-y-6">
                {results.map((post, index) => (
                  <SearchResultCard key={`${post.id}-${index}`} post={post} />
                ))}

                {/* Load more indicator */}
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {isFetchingNextPage ? (
                    <LoadingSpinner text="더 많은 결과를 불러오는 중..." />
                  ) : hasNextPage ? (
                    <div className="text-gray-500 text-sm">
                      {isNearEnd ? '더 많은 결과를 불러오는 중...' : '스크롤하여 더 많은 결과 보기'}
                    </div>
                  ) : results.length > 0 ? (
                    <div className="text-gray-400 text-sm">
                      모든 검색 결과를 확인했습니다 ✨
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Search result card component
function SearchResultCard({ post }: { post: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.avatar_url} alt={post.author.username} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {generateInitials(post.author.username)}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{post.author.username}</h3>
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `${post.category_color}20`,
                    color: post.category_color
                  }}
                >
                  {post.category_icon} {post.category_name}
                </Badge>
                {post.relevance_score && (
                  <Badge variant="outline" className="text-xs">
                    관련도 {Math.round(post.relevance_score * 100)}%
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                {post.baby_month !== undefined && (
                  <>
                    <Baby className="w-3 h-3" />
                    <span>{post.baby_month}개월</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap line-clamp-3">
            {post.content}
          </p>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
            {post.images.slice(0, 2).map((image: string, index: number) => (
              <div key={index} className="relative aspect-video">
                <Image
                  src={image}
                  alt={`Post image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{post.tags.length - 3}개
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <PostInteractionsV3
            postId={post.id}
            initialLikesCount={post.likes_count}
            initialCommentsCount={post.comments_count}
          />
          <Link href={`/post/${post.id}`}>
            <Button variant="ghost" size="sm">
              자세히 보기
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}