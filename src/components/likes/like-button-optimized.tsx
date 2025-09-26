/**
 * 최적화된 좋아요 버튼 컴포넌트
 * - 이벤트 리스너 단순화 (click 이벤트만 사용)
 * - console.log 제거 및 logger 사용
 * - 디바운스 로직 추가
 * - 접근성 개선
 */

'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Heart, Users } from 'lucide-react'
import { useLikes } from '@/contexts/like-context'
import { useResilientAuth as useAuth } from '@/contexts/resilient-auth-context'
import { useNotifications } from '@/contexts/notification-context'
import { isValidForSupabase } from '@/lib/utils/uuid-validation'
import { toast } from 'sonner'
import { logger } from '@/lib/utils/logger'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  postId: string
  initialLikesCount?: number
  variant?: 'default' | 'compact' | 'icon-only'
  showLikesModal?: boolean
  className?: string
}

export function LikeButtonOptimized({
  postId,
  initialLikesCount = 0,
  variant = 'default',
  showLikesModal = true,
  className = ''
}: LikeButtonProps) {
  // State for loading and debounce
  const [isToggling, setIsToggling] = useState(false)
  const [lastToggleTime, setLastToggleTime] = useState(0)

  // Validate UUID
  const isValidPostId = useMemo(() => isValidForSupabase(postId), [postId])

  const { user, isAuthenticated } = useAuth()
  const {
    toggleLike,
    isLiked,
    getLikesCount,
    openLikes,
    loadLikes
  } = useLikes()
  const { realtimeCounts } = useNotifications()

  // Memoized values
  const liked = useMemo(() => isLiked(postId), [isLiked, postId])
  const likesCount = useMemo(() => {
    const realtimeLikesCount = realtimeCounts[postId]?.likes
    return realtimeLikesCount !== undefined ? realtimeLikesCount : (getLikesCount(postId) || initialLikesCount)
  }, [realtimeCounts, postId, getLikesCount, initialLikesCount])

  // Load initial likes data
  useEffect(() => {
    if (user?.id && isValidPostId) {
      loadLikes(postId)
    }
  }, [postId, user?.id, loadLikes, isValidPostId])

  // Debounced like toggle handler
  const handleLikeToggle = useCallback(async (event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault()
    event.stopPropagation()

    // Debounce: prevent rapid clicking (500ms cooldown)
    const now = Date.now()
    if (now - lastToggleTime < 500) {
      logger.warn('Like button: Too rapid clicking prevented', { postId })
      return
    }
    setLastToggleTime(now)

    if (!isValidPostId) {
      logger.error('Like button: Invalid postId', { postId })
      toast.error('잘못된 게시글 ID입니다.')
      return
    }

    if (!isAuthenticated || !user?.id) {
      logger.info('Like button: User not authenticated', { postId })
      toast.error('로그인이 필요합니다.')
      return
    }

    setIsToggling(true)
    logger.time(`like-toggle-${postId}`)

    try {
      const result = await toggleLike(postId)

      if (result?.success) {
        const message = result.liked ? '💕 포근한 마음을 전했어요!' : '포근함을 취소했어요.'
        toast.success(message)
        logger.log('Like toggle success', { postId, liked: result.liked })
      } else {
        toast.error('좋아요 처리에 실패했습니다.')
        logger.error('Like toggle failed', null, { postId, result })
      }
    } catch (error) {
      logger.error('Like toggle error', error, { postId })
      toast.error('오류가 발생했습니다.')
    } finally {
      setIsToggling(false)
      logger.timeEnd(`like-toggle-${postId}`)
    }
  }, [postId, toggleLike, isAuthenticated, user?.id, isValidPostId, lastToggleTime])

  // Show likes modal handler
  const handleShowLikes = useCallback(async (event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (likesCount === 0) {
      toast.info('아직 좋아요가 없습니다.')
      return
    }

    try {
      await openLikes(postId)
      logger.log('Likes modal opened', { postId, likesCount })
    } catch (error) {
      logger.error('Failed to open likes modal', error, { postId })
      toast.error('좋아요 목록을 불러오는데 실패했습니다.')
    }
  }, [postId, openLikes, likesCount])

  // Keyboard handler
  const handleKeyDown = useCallback((handler: (e: React.KeyboardEvent) => void) =>
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handler(event)
      }
    }, []
  )

  // Loading state for toggle
  if (isToggling && variant === 'icon-only') {
    return (
      <div className={cn("like-button flex items-center justify-center min-h-[44px] min-w-[44px]", className)}>
        <LoadingSpinner size="sm" text="" />
      </div>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <button
          onClick={handleLikeToggle}
          onKeyDown={handleKeyDown(handleLikeToggle)}
          disabled={isToggling || !isValidPostId}
          className={cn(
            "like-button p-2 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            liked
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "text-gray-500 hover:bg-gray-100"
          )}
          aria-label={`좋아요 ${liked ? '취소' : '누르기'}`}
          aria-pressed={liked}
        >
          {isToggling ? (
            <LoadingSpinner size="sm" text="" />
          ) : (
            <Heart className={cn("w-5 h-5", liked && "fill-current")} />
          )}
        </button>

        {showLikesModal && likesCount > 0 && (
          <button
            onClick={handleShowLikes}
            onKeyDown={handleKeyDown(handleShowLikes)}
            className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded px-2 py-1 min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            aria-label={`좋아요 목록 보기 - ${likesCount}개`}
          >
            {likesCount}
          </button>
        )}
      </div>
    )
  }

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleLikeToggle}
        onKeyDown={handleKeyDown(handleLikeToggle)}
        disabled={isToggling || !isValidPostId}
        className={cn(
          "like-button p-2 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          liked
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "text-gray-500 hover:bg-gray-100",
          className
        )}
        aria-label={`좋아요 ${liked ? '취소' : '누르기'} - ${likesCount}개`}
        aria-pressed={liked}
      >
        {isToggling ? (
          <LoadingSpinner size="sm" text="" />
        ) : (
          <Heart className={cn("w-6 h-6", liked && "fill-current")} />
        )}
      </button>
    )
  }

  // Default variant
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* Like button */}
      <button
        onClick={handleLikeToggle}
        onKeyDown={handleKeyDown(handleLikeToggle)}
        disabled={isToggling || !isValidPostId}
        className={cn(
          "like-button flex items-center space-x-2 px-4 py-2 rounded-full transition-colors min-h-[44px]",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          liked
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "text-gray-500 hover:bg-gray-100"
        )}
        aria-label={`좋아요 ${liked ? '취소' : '누르기'}`}
        aria-pressed={liked}
        data-post-id={postId}
      >
        {isToggling ? (
          <>
            <LoadingSpinner size="sm" text="" />
            <span className="text-sm font-medium">{likesCount}</span>
          </>
        ) : (
          <>
            <Heart className={cn("w-5 h-5", liked && "fill-current")} />
            <span className="text-sm font-medium">{likesCount}</span>
          </>
        )}
      </button>

      {/* Likes list button */}
      {showLikesModal && likesCount > 0 && (
        <button
          onClick={handleShowLikes}
          onKeyDown={handleKeyDown(handleShowLikes)}
          className="flex items-center space-x-1 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label={`좋아요 목록 보기 - ${likesCount}명`}
        >
          <Users className="w-4 h-4" />
          <span className="text-xs">{likesCount}명</span>
        </button>
      )}
    </div>
  )
}