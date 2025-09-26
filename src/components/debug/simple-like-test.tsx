'use client'

import { useState } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { useLikes } from '@/contexts/like-context'
import { useComments } from '@/contexts/comment-context'
import { useAuth } from '@/contexts/simple-auth-context'
import { toast } from 'sonner'

interface SimpleLikeTestProps {
  postId: string
}

export function SimpleLikeTest({ postId }: SimpleLikeTestProps) {
  console.log('🔍 SimpleLikeTest: Received postId:', {
    postId: JSON.stringify(postId),
    type: typeof postId,
    length: postId?.length,
    keys: typeof postId === 'object' ? Object.keys(postId) : 'N/A',
    stringified: String(postId)
  })

  const { user, isAuthenticated } = useAuth()
  const { toggleLike, isLiked, getLikesCount } = useLikes()
  const { toggleComments, getCommentsCount } = useComments()
  const [isLoading, setIsLoading] = useState(false)

  const handleLikeClick = async () => {
    console.log('🔥 Simple Like Test: Click event!', { postId, user: user?.id, isAuthenticated })

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.')
      return
    }

    setIsLoading(true)
    try {
      const result = await toggleLike(postId)
      if (result?.success) {
        toast.success(result.liked ? '좋아요!' : '좋아요 취소')
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
    console.log('🔥 Simple Comment Test: Click event!', { postId, user: user?.id, isAuthenticated })

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.')
      return
    }

    try {
      await toggleComments(postId)
      toast.success('댓글 모달 토글!')
    } catch (error) {
      console.error('Comment error:', error)
      toast.error('오류가 발생했습니다.')
    }
  }

  const liked = isLiked(postId)
  const likesCount = getLikesCount(postId)
  const commentsCount = getCommentsCount(postId)

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="text-lg font-bold mb-4">Simple Like/Comment Test</h3>
      <p className="mb-2">Post ID: {postId}</p>
      <p className="mb-4">User: {user?.id || 'Not logged in'}</p>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleLikeClick}
          disabled={isLoading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            liked
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={handleCommentClick}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{commentsCount}</span>
        </button>
      </div>
    </div>
  )
}