'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Bookmark } from 'lucide-react'
import { toggleLike, toggleBookmark } from '@/lib/posts/actions'
import { useComments } from '@/contexts/comment-context'
import { toast } from 'sonner'

interface PostInteractionsV2Props {
  postId: string
  initialLiked: boolean
  initialBookmarked: boolean
  likesCount: number
  commentsCount: number
  viewsCount: number
  isLoggedIn?: boolean
}

export function PostInteractionsV2({
  postId,
  initialLiked,
  initialBookmarked,
  likesCount,
  commentsCount,
  viewsCount,
  isLoggedIn = false
}: PostInteractionsV2Props) {
  console.log('🚀 PostInteractionsV2 렌더링! Post ID:', postId)
  
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount)
  const [isPendingLike, startLikeTransition] = useTransition()
  const [isPendingBookmark, startBookmarkTransition] = useTransition()
  
  // 댓글 시스템 연동
  const { toggleComments, getCommentsCount, isCommentsOpen } = useComments()
  const commentButtonRef = useRef<HTMLDivElement>(null)
  
  // 네이티브 DOM 이벤트로 댓글 버튼 처리
  useEffect(() => {
    const commentButton = commentButtonRef.current
    if (!commentButton) return
    
    console.log('🔧 PostInteractionsV2: 네이티브 DOM 이벤트 리스너 등록')
    
    const handleCommentClick = async (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
      
      console.log('🔥 PostInteractionsV2: 네이티브 DOM 클릭 이벤트 발생!', postId)
      
      if (!isLoggedIn) {
        toast.error('로그인이 필요합니다.')
        return
      }
      
      try {
        await toggleComments(postId)
        console.log('✅ PostInteractionsV2: 댓글 토글 완료')
      } catch (error) {
        console.error('❌ PostInteractionsV2: 댓글 토글 오류', error)
        toast.error('댓글을 불러오는데 실패했습니다.')
      }
    }
    
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        console.log('🔥 PostInteractionsV2: 네이티브 키보드 이벤트!')
        
        if (!isLoggedIn) {
          toast.error('로그인이 필요합니다.')
          return
        }
        
        try {
          await toggleComments(postId)
        } catch (error) {
          console.error('❌ 키보드 이벤트 오류:', error)
        }
      }
    }
    
    // 다중 이벤트 등록으로 확실하게 캐치
    commentButton.addEventListener('click', handleCommentClick, { passive: false })
    commentButton.addEventListener('mousedown', handleCommentClick, { passive: false })
    commentButton.addEventListener('touchstart', handleCommentClick, { passive: false })
    commentButton.addEventListener('keydown', handleKeyDown)
    
    return () => {
      console.log('🧹 PostInteractionsV2: 네이티브 DOM 이벤트 리스너 제거')
      commentButton.removeEventListener('click', handleCommentClick)
      commentButton.removeEventListener('mousedown', handleCommentClick)
      commentButton.removeEventListener('touchstart', handleCommentClick)
      commentButton.removeEventListener('keydown', handleKeyDown)
    }
  }, [postId, toggleComments, isLoggedIn])

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

  const actualCommentsCount = getCommentsCount(postId) || commentsCount
  const commentsOpen = isCommentsOpen(postId)

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
        
        {/* 네이티브 DOM 이벤트 기반 댓글 버튼 */}
        <div
          ref={commentButtonRef}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors cursor-pointer select-none min-h-[44px] touch-manipulation ${
            commentsOpen 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-500 hover:bg-gray-100'
          } border-2 border-dashed border-green-300`}
          role="button"
          tabIndex={0}
          aria-label={`댓글 ${commentsOpen ? '닫기' : '열기'} - 댓글 ${actualCommentsCount}개`}
          title={`댓글 ${commentsOpen ? '닫기' : '열기'} (네이티브 DOM V2)`}
          data-post-id={postId}
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm font-medium">{actualCommentsCount}</span>
          <span className="text-xs bg-green-100 text-green-700 px-1 rounded">V2</span>
          {commentsOpen && <span className="text-xs ml-1">열림</span>}
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