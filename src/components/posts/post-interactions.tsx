'use client'

import { useState, useTransition } from 'react'
import { Heart, MessageCircle, Bookmark } from 'lucide-react'
import { toggleLike, toggleBookmark } from '@/lib/posts/actions'
import { toast } from 'sonner'

interface PostInteractionsProps {
  postId: string
  initialLiked: boolean
  initialBookmarked: boolean
  likesCount: number
  commentsCount: number
  viewsCount: number
  isLoggedIn?: boolean
}

export function PostInteractions({
  postId,
  initialLiked,
  initialBookmarked,
  likesCount,
  commentsCount,
  viewsCount,
  isLoggedIn = false
}: PostInteractionsProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount)
  const [isPendingLike, startLikeTransition] = useTransition()
  const [isPendingBookmark, startBookmarkTransition] = useTransition()

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error('로그인이 필요합니다.')
      return
    }

    startLikeTransition(async () => {
      // Optimistic update
      const previousLiked = isLiked
      const previousCount = currentLikesCount
      setIsLiked(!isLiked)
      setCurrentLikesCount(prev => isLiked ? prev - 1 : prev + 1)

      try {
        const result = await toggleLike(postId)
        
        if (result?.error) {
          // Revert optimistic update on error
          setIsLiked(previousLiked)
          setCurrentLikesCount(previousCount)
          toast.error(result.error)
        } else {
          // Success feedback
          if (result?.liked) {
            toast.success('💕 포근한 마음을 전했어요!')
          } else {
            toast.success('포근함을 취소했어요.')
          }
        }
      } catch (error) {
        // Revert optimistic update on error
        setIsLiked(previousLiked)
        setCurrentLikesCount(previousCount)
        toast.error('오류가 발생했습니다.')
      }
    })
  }

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      toast.error('로그인이 필요합니다.')
      return
    }

    startBookmarkTransition(async () => {
      // Optimistic update
      const previousBookmarked = isBookmarked
      setIsBookmarked(!isBookmarked)

      try {
        const result = await toggleBookmark(postId)
        
        if (result?.error) {
          // Revert optimistic update on error
          setIsBookmarked(previousBookmarked)
          toast.error(result.error)
        } else {
          // Success feedback
          if (result?.bookmarked) {
            toast.success('📚 북마크에 저장했어요!')
          } else {
            toast.success('북마크에서 제거했어요.')
          }
        }
      } catch (error) {
        // Revert optimistic update on error
        setIsBookmarked(previousBookmarked)
        toast.error('오류가 발생했습니다.')
      }
    })
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <div className="flex items-center space-x-6">
        {/* Like Button */}
        <button
          onClick={handleLike}
          disabled={isPendingLike}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors min-h-[44px] touch-manipulation ${
            isLiked
              ? 'bg-pink-100 text-pink-600'
              : 'text-gray-500 hover:bg-gray-100'
          } ${isPendingLike ? 'opacity-50' : ''}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{currentLikesCount}</span>
        </button>
        
        {/* Comments Button */}
        <div className="flex items-center space-x-2 px-3 py-2 text-gray-500 min-h-[44px]">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{commentsCount}</span>
        </div>
        
        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          disabled={isPendingBookmark}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors min-h-[44px] touch-manipulation ${
            isBookmarked
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-500 hover:bg-gray-100'
          } ${isPendingBookmark ? 'opacity-50' : ''}`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-right">
        조회 {viewsCount.toLocaleString()}
      </div>
    </div>
  )
}