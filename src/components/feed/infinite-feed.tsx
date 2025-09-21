/**
 * 무한 스크롤 피드 컴포넌트
 * React Query + Intersection Observer를 활용한 성능 최적화된 무한 스크롤
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { PostSkeleton } from '@/components/ui/skeleton'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorMessage } from '@/components/ui/error-message'
import { PostInteractionsV3 } from '@/components/posts/post-interactions-v3'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback, generateInitials } from '@/components/ui/avatar'
import { MoreVertical, Baby, Clock, Lock, Heart, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { logger } from '@/lib/utils/logger'
import { cn } from '@/lib/utils'

interface PostAuthor {
  id: string
  username: string
  avatar_url?: string
  baby_birth_date?: string
  baby_name?: string
  is_pregnant?: boolean
  pregnancy_week?: number
}

interface Post {
  id: string
  content: string
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  baby_month?: number
  images?: string[]
  hugs: number
  views: number
  is_question: boolean
  tags?: string[]
  mood?: string
  created_at: string
  updated_at: string
  author: PostAuthor
  comments_count: number
  likes_count: number
}

interface FetchPostsResponse {
  posts: Post[]
  hasMore: boolean
  nextCursor?: string
}

interface InfiniteFeedProps {
  category?: string
  initialPosts?: Post[]
  pageSize?: number
  className?: string
}

const POSTS_PER_PAGE = 10

export function InfiniteFeed({
  category,
  initialPosts = [],
  pageSize = POSTS_PER_PAGE,
  className
}: InfiniteFeedProps) {
  const supabase = createClient()

  // Fetch posts with pagination
  const fetchPosts = useCallback(async ({ pageParam = 0 }): Promise<FetchPostsResponse> => {
    logger.time(`fetch-posts-page-${pageParam}`)

    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          content,
          category_id,
          baby_month,
          images,
          hugs,
          views,
          is_question,
          tags,
          mood,
          created_at,
          updated_at,
          profiles!posts_author_id_fkey (
            id,
            username,
            avatar_url,
            baby_birth_date,
            baby_name,
            is_pregnant,
            pregnancy_week
          ),
          post_categories!posts_category_id_fkey (
            name,
            icon,
            color
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1)

      if (category) {
        query = query.eq('category_id', category)
      }

      const { data, error, count } = await query

      if (error) {
        logger.error('Failed to fetch posts', error, { pageParam, category })
        throw error
      }

      // Transform data
      const posts: Post[] = (data || []).map(post => ({
        ...post,
        author: post.profiles as PostAuthor,
        category_name: post.post_categories?.name || 'General',
        category_icon: post.post_categories?.icon || '📝',
        category_color: post.post_categories?.color || '#6B7280',
        comments_count: 0, // TODO: Add real count
        likes_count: post.hugs || 0
      }))

      const hasMore = data ? data.length === pageSize : false

      logger.log('Posts fetched successfully', {
        pageParam,
        count: posts.length,
        hasMore,
        category
      })

      return {
        posts,
        hasMore,
        nextCursor: hasMore ? String(pageParam + 1) : undefined
      }
    } finally {
      logger.timeEnd(`fetch-posts-page-${pageParam}`)
    }
  }, [supabase, category, pageSize])

  // React Query infinite query
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery({
    queryKey: ['posts', category],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => lastPage.nextCursor ? parseInt(lastPage.nextCursor) : undefined,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  })

  // Flatten all posts from all pages
  const posts = useMemo(() => {
    const allPosts = data?.pages.flatMap(page => page.posts) || []
    if (initialPosts.length > 0 && allPosts.length === 0) {
      return initialPosts
    }
    return allPosts
  }, [data?.pages, initialPosts])

  // Infinite scroll hook
  const { loadMoreRef, isNearEnd } = useInfiniteScroll(
    () => {
      if (!isFetchingNextPage) {
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

  // Handle retry
  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(3)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className={cn("p-4", className)}>
        <ErrorMessage
          title="피드를 불러올 수 없습니다"
          message={error?.message || "네트워크 연결을 확인하고 다시 시도해주세요."}
          retry={handleRetry}
        />
      </div>
    )
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Baby className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          아직 게시글이 없어요
        </h3>
        <p className="text-gray-500">
          첫 번째 게시글을 작성해서 소중한 이야기를 나눠보세요!
        </p>
        <Button asChild className="mt-4">
          <Link href="/write">첫 게시글 작성하기</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Posts */}
      {posts.map((post, index) => (
        <PostCard key={`${post.id}-${index}`} post={post} />
      ))}

      {/* Loading more indicator */}
      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isFetchingNextPage ? (
          <LoadingSpinner text="더 많은 게시글을 불러오는 중..." />
        ) : hasNextPage ? (
          <div className="text-gray-500 text-sm">
            {isNearEnd ? '더 많은 게시글을 불러오는 중...' : '스크롤하여 더 많은 게시글 보기'}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">
            모든 게시글을 확인했습니다 ✨
          </div>
        )}
      </div>
    </div>
  )
}

// Post card component
function PostCard({ post }: { post: Post }) {
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
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  backgroundColor: `${post.category_color}20`,
                  color: post.category_color
                }}>
                  {post.category_icon} {post.category_name}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                {post.baby_month && (
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
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
            {post.images.slice(0, 4).map((image, index) => (
              <div key={index} className="relative aspect-square">
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
            {post.tags.map((tag, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4">
        <PostInteractionsV3
          postId={post.id}
          initialLiked={false}
          initialBookmarked={false}
          likesCount={post.likes_count}
          commentsCount={post.comments_count}
          viewsCount={post.views}
          isLoggedIn={false}
          variant="full"
          postTitle={post.content.substring(0, 50)}
          postContent={post.content}
        />
      </div>
    </Card>
  )
}