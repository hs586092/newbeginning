'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getUserBookmarks, getBookmarkCount } from '@/lib/actions/bookmarks'
import { BookmarkButton } from '@/components/ui/bookmark-button'
import { ShareButton } from '@/components/ui/share-button'
import { SearchBar } from '@/components/search/search-bar'
import { PostSkeleton } from '@/components/ui/skeleton'
import { ErrorMessage } from '@/components/ui/error-message'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback, generateInitials } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useBookmark } from '@/hooks/use-bookmark'
import { Bookmark, Clock, MessageCircle, Heart, Search, Filter, SortAsc } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface BookmarkPost {
  id: string
  created_at: string
  posts: {
    id: string
    content: string
    created_at: string
    updated_at: string
    category_id: string
    baby_month?: number
    images?: string[]
    is_question: boolean
    tags?: string[]
    mood?: string
    profiles: {
      id: string
      username: string
      avatar_url?: string
      baby_birth_date?: string
      baby_name?: string
      is_pregnant?: boolean
      pregnancy_week?: number
    }
  }
}

interface BookmarksData {
  bookmarks: BookmarkPost[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export function BookmarksPageClient() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [bookmarksData, setBookmarksData] = useState<BookmarksData | null>(null)
  const [bookmarkCount, setBookmarkCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent')

  // Load bookmarks
  const loadBookmarks = async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    setError(null)

    try {
      const [bookmarksResult, countResult] = await Promise.all([
        getUserBookmarks(1, 20),
        getBookmarkCount()
      ])

      if (bookmarksResult.success && bookmarksResult.data) {
        setBookmarksData(bookmarksResult.data)
      } else {
        setError(bookmarksResult.error || '북마크를 불러오는데 실패했습니다.')
      }

      setBookmarkCount(countResult.count)

    } catch (error) {
      console.error('Load bookmarks error:', error)
      setError('북마크를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated) {
      loadBookmarks()
    }
  }, [isAuthenticated, authLoading])

  // Filter bookmarks by search query
  const filteredBookmarks = bookmarksData?.bookmarks.filter(bookmark =>
    bookmark.posts.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.posts.profiles.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Sort bookmarks
  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortBy === 'recent' ? dateB - dateA : dateA - dateB
  })

  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Router will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">북마크</h1>
          </div>
          <p className="text-gray-600">
            저장한 게시글 {bookmarkCount}개
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="북마크에서 검색하기..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 mr-2">정렬:</span>
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('recent')}
            >
              최신순
            </Button>
            <Button
              variant={sortBy === 'oldest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('oldest')}
            >
              오래된순
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <ErrorMessage
            title="북마크를 불러올 수 없습니다"
            message={error}
            onRetry={loadBookmarks}
          />
        )}

        {/* Empty State */}
        {!error && !isLoading && sortedBookmarks.length === 0 && (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '아직 북마크한 글이 없어요'}
            </h2>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? '다른 검색어로 시도해보세요'
                : '마음에 드는 글을 북마크해보세요'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/')}>
                게시글 둘러보기
              </Button>
            )}
          </div>
        )}

        {/* Bookmarks List */}
        {!error && sortedBookmarks.length > 0 && (
          <div className="space-y-4">
            {sortedBookmarks.map((bookmark) => (
              <BookmarkPostCard
                key={bookmark.id}
                bookmark={bookmark}
                onBookmarkChange={loadBookmarks}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {bookmarksData?.pagination.hasMore && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement load more functionality
                toast.info('더 불러오기 기능을 구현 중입니다.')
              }}
            >
              더 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// BookmarkPostCard Component
function BookmarkPostCard({ bookmark, onBookmarkChange }: {
  bookmark: BookmarkPost
  onBookmarkChange: () => void
}) {
  const post = bookmark.posts
  const author = post.profiles

  const { toggleBookmark } = useBookmark({
    postId: post.id,
    initialIsBookmarked: true
  })

  const handleBookmarkToggle = async () => {
    await toggleBookmark()
    onBookmarkChange() // Refresh the list
  }

  const bookmarkedAt = formatDistanceToNow(new Date(bookmark.created_at), {
    addSuffix: true,
    locale: ko
  })

  const postCreatedAt = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko
  })

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={author.avatar_url} alt={author.username} />
            <AvatarFallback>
              {generateInitials(author.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">{author.username}</h3>
            <p className="text-sm text-gray-500">
              {postCreatedAt} 작성 • {bookmarkedAt} 북마크
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShareButton
            postId={post.id}
            postTitle={post.content.substring(0, 50)}
            postContent={post.content}
            size="sm"
          />
          <BookmarkButton
            postId={post.id}
            isBookmarked={true}
            onToggle={handleBookmarkToggle}
            size="sm"
          />
        </div>
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`} className="block">
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed">
            {post.content.length > 200
              ? `${post.content.substring(0, 200)}...`
              : post.content
            }
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{post.tags.length - 3}개
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
        <div className="flex items-center gap-4">
          {post.is_question && (
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              질문
            </span>
          )}
          {author.baby_birth_date && (
            <span className="flex items-center gap-1">
              👶 {post.baby_month}개월
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{bookmarkedAt} 저장</span>
        </div>
      </div>
    </Card>
  )
}