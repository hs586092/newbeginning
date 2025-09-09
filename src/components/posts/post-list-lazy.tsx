'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { PostCard } from './post-card'
import type { PostWithDetails } from '@/types/database.types'

interface PostListLazyProps {
  initialPosts: PostWithDetails[]
  currentUserId?: string
  onPostDelete?: (postId: string) => void
  className?: string
}

const INITIAL_LOAD = 5
const LOAD_MORE_COUNT = 10

export function PostListLazy({ 
  initialPosts, 
  currentUserId, 
  onPostDelete,
  className = '' 
}: PostListLazyProps) {
  const [displayedCount, setDisplayedCount] = useState(INITIAL_LOAD)
  const [isLoading, setIsLoading] = useState(false)

  // Memoize displayed posts to prevent unnecessary re-renders
  const displayedPosts = useMemo(() => 
    initialPosts.slice(0, displayedCount),
    [initialPosts, displayedCount]
  )

  // Intersection Observer for infinite scroll
  const [sentinelRef, setSentinelRef] = useState<HTMLDivElement | null>(null)

  const loadMore = useCallback(() => {
    if (isLoading || displayedCount >= initialPosts.length) return
    
    setIsLoading(true)
    
    // Simulate network delay for smooth UX
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + LOAD_MORE_COUNT, initialPosts.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, displayedCount, initialPosts.length])

  useEffect(() => {
    if (!sentinelRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      {
        rootMargin: '100px', // Load when user is 100px away from the sentinel
      }
    )

    observer.observe(sentinelRef)
    
    return () => observer.disconnect()
  }, [sentinelRef, loadMore])

  const hasMore = displayedCount < initialPosts.length

  return (
    <div className={className}>
      <div className="space-y-6">
        {displayedPosts.map((post, index) => (
          <div
            key={post.id}
            className="opacity-0 animate-fade-in"
            style={{
              animationDelay: `${Math.min(index * 100, 500)}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <PostCard
              post={post}
              currentUserId={currentUserId}
              isOwner={currentUserId === post.user_id}
              onDelete={onPostDelete}
            />
          </div>
        ))}
      </div>

      {/* Loading indicator and sentinel */}
      {hasMore && (
        <div
          ref={setSentinelRef}
          className="flex items-center justify-center py-8"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">더 많은 게시글을 불러오는 중...</span>
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="px-6 py-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              aria-label="더 많은 게시글 불러오기"
            >
              더 보기 ({initialPosts.length - displayedCount}개 남음)
            </button>
          )}
        </div>
      )}

      {!hasMore && initialPosts.length > INITIAL_LOAD && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">모든 게시글을 불러왔습니다</p>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}