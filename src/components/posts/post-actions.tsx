'use client'

import { useState } from 'react'
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react'
import { useLikes } from '@/contexts/like-context'
import { useComments } from '@/contexts/comment-context'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

interface PostActionsProps {
  postId: string
  className?: string
}

export function PostActions({ postId, className = '' }: PostActionsProps) {
  const { user, isAuthenticated } = useAuth()
  const { toggleLike, isLiked, getLikesCount } = useLikes()
  const { toggleComments, getCommentsCount } = useComments()
  const [isLoading, setIsLoading] = useState(false)

  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.')
      return
    }

    setIsLoading(true)
    try {
      const result = await toggleLike(postId)
      if (result?.success) {
        // 조용한 피드백 - 토스트 없이 시각적 변화만
      } else {
        toast.error('좋아요 실패')
      }
    } catch (error) {
      console.error('Like error:', error)
      toast.error('오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentClick = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.')
      return
    }

    try {
      await toggleComments(postId)
    } catch (error) {
      console.error('Comment error:', error)
      toast.error('오류가 발생했습니다.')
    }
  }

  const liked = isLiked(postId)
  const likesCount = getLikesCount(postId)
  const commentsCount = getCommentsCount(postId)

  return (
    <div className={`flex items-center justify-between pt-3 border-t border-gray-100 ${className}`}>
      {/* 좋아요/댓글 버튼들 */}
      <div className="flex items-center space-x-6">
        {/* 좋아요 버튼 */}
        <button
          onClick={handleLikeClick}
          disabled={isLoading}
          className={`flex items-center space-x-2 text-sm transition-colors ${
            liked
              ? 'text-red-500'
              : 'text-gray-500 hover:text-red-500'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Heart
            className={`w-5 h-5 transition-all ${liked ? 'fill-current text-red-500' : ''}`}
          />
          <span className={liked ? 'text-red-500 font-medium' : ''}>{likesCount}</span>
        </button>

        {/* 댓글 버튼 */}
        <button
          onClick={handleCommentClick}
          className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{commentsCount}</span>
        </button>

        {/* 답글 버튼 */}
        <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          답글
        </button>
      </div>

      {/* 더보기 버튼 */}
      <button className="text-gray-400 hover:text-gray-600 transition-colors">
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
  )
}