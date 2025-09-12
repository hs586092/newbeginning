/**
 * 통합된 PostInteractions V3
 * 댓글 시스템 + 좋아요 시스템 새 아키텍처 통합 버전
 */

'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Bookmark, Users } from 'lucide-react'
import { toggleBookmark } from '@/lib/posts/actions'
import { useComments } from '@/contexts/comment-context'
import { useLikes } from '@/contexts/like-context'
import { toast } from 'sonner'

interface PostInteractionsV3Props {
  postId: string
  initialLiked?: boolean
  initialBookmarked: boolean
  likesCount?: number
  commentsCount?: number
  viewsCount: number
  isLoggedIn?: boolean
  currentUserId?: string
  variant?: 'full' | 'compact'
  showLikesModal?: boolean
}

export function PostInteractionsV3({
  postId,
  initialLiked = false,
  initialBookmarked,
  likesCount: initialLikesCount = 0,
  commentsCount: initialCommentsCount = 0,
  viewsCount,
  isLoggedIn = false,
  currentUserId,
  variant = 'full',
  showLikesModal = true
}: PostInteractionsV3Props) {
  console.log('🚀 PostInteractionsV3 렌더링! Post ID:', postId)
  
  // 북마크 상태 (기존 로직 유지)
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isPendingBookmark, startBookmarkTransition] = useTransition()
  
  // 댓글 시스템 연동
  const { toggleComments, getCommentsCount, isCommentsOpen } = useComments()
  const commentButtonRef = useRef<HTMLDivElement>(null)
  
  // 좋아요 시스템 연동 (새 아키텍처)
  const { 
    toggleLike, 
    isLiked, 
    getLikesCount, 
    openLikes,
    loadLikes 
  } = useLikes()
  const likeButtonRef = useRef<HTMLDivElement>(null)
  const likesListButtonRef = useRef<HTMLDivElement>(null)
  
  // 동적 상태 값들
  const liked = isLiked(postId)
  const likesCount = getLikesCount(postId) || initialLikesCount
  const commentsCount = getCommentsCount(postId) || initialCommentsCount
  const commentsOpen = isCommentsOpen(postId)
  
  // 컴포넌트 마운트 시 좋아요 상태 로드
  useEffect(() => {
    if (currentUserId) {
      loadLikes(postId)
    }
  }, [postId, currentUserId, loadLikes])
  
  // 좋아요 토글 Native DOM 이벤트 처리
  useEffect(() => {
    const likeButton = likeButtonRef.current
    if (!likeButton) return
    
    console.log('🔧 PostInteractionsV3: 좋아요 네이티브 DOM 이벤트 리스너 등록')
    
    const handleLikeToggle = async (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
      
      console.log('🔥 PostInteractionsV3: 좋아요 토글 이벤트 발생!', postId)
      
      if (!isLoggedIn) {
        toast.error('로그인이 필요합니다.')
        return
      }
      
      try {
        const result = await toggleLike(postId)
        
        if (result?.success) {
          if (result.liked) {
            toast.success('💕 포근한 마음을 전했어요!')
          } else {
            toast.success('포근함을 취소했어요.')
          }
        } else {
          toast.error('좋아요 처리에 실패했습니다.')
        }
      } catch (error) {
        console.error('❌ PostInteractionsV3: 좋아요 토글 오류', error)
        toast.error('오류가 발생했습니다.')
      }
    }
    
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        await handleLikeToggle(event)
      }
    }
    
    // 다중 이벤트 등록
    likeButton.addEventListener('click', handleLikeToggle, { passive: false })
    likeButton.addEventListener('mousedown', handleLikeToggle, { passive: false })
    likeButton.addEventListener('touchstart', handleLikeToggle, { passive: false })
    likeButton.addEventListener('keydown', handleKeyDown)
    
    return () => {
      console.log('🧹 PostInteractionsV3: 좋아요 네이티브 DOM 이벤트 리스너 제거')
      likeButton.removeEventListener('click', handleLikeToggle)
      likeButton.removeEventListener('mousedown', handleLikeToggle)
      likeButton.removeEventListener('touchstart', handleLikeToggle)
      likeButton.removeEventListener('keydown', handleKeyDown)
    }
  }, [postId, toggleLike, isLoggedIn])
  
  // 좋아요 목록 보기 Native DOM 이벤트 처리
  useEffect(() => {
    const likesListButton = likesListButtonRef.current
    if (!likesListButton || !showLikesModal) return
    
    console.log('🔧 PostInteractionsV3: 좋아요 목록 네이티브 DOM 이벤트 리스너 등록')
    
    const handleShowLikes = async (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
      
      console.log('🔥 PostInteractionsV3: 좋아요 목록 보기 이벤트 발생!', postId)
      
      if (likesCount === 0) {
        toast.info('아직 좋아요가 없습니다.')
        return
      }
      
      try {
        await openLikes(postId)
        console.log('✅ PostInteractionsV3: 좋아요 목록 열기 완료')
      } catch (error) {
        console.error('❌ PostInteractionsV3: 좋아요 목록 오류', error)
        toast.error('좋아요 목록을 불러오는데 실패했습니다.')
      }
    }
    
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        await handleShowLikes(event)
      }
    }
    
    // 다중 이벤트 등록
    likesListButton.addEventListener('click', handleShowLikes, { passive: false })
    likesListButton.addEventListener('keydown', handleKeyDown)
    
    return () => {
      console.log('🧹 PostInteractionsV3: 좋아요 목록 네이티브 DOM 이벤트 리스너 제거')
      likesListButton.removeEventListener('click', handleShowLikes)
      likesListButton.removeEventListener('keydown', handleKeyDown)
    }
  }, [postId, openLikes, showLikesModal, likesCount])
  
  // 댓글 토글 Native DOM 이벤트 처리 (기존 로직 유지)
  useEffect(() => {
    const commentButton = commentButtonRef.current
    if (!commentButton) return
    
    console.log('🔧 PostInteractionsV3: 댓글 네이티브 DOM 이벤트 리스너 등록')
    
    const handleCommentClick = async (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
      
      console.log('🔥 PostInteractionsV3: 댓글 토글 이벤트 발생!', postId)
      
      if (!isLoggedIn) {
        toast.error('로그인이 필요합니다.')
        return
      }
      
      try {
        await toggleComments(postId)
        console.log('✅ PostInteractionsV3: 댓글 토글 완료')
      } catch (error) {
        console.error('❌ PostInteractionsV3: 댓글 토글 오류', error)
        toast.error('댓글을 불러오는데 실패했습니다.')
      }
    }
    
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        await handleCommentClick(event)
      }
    }
    
    // 다중 이벤트 등록
    commentButton.addEventListener('click', handleCommentClick, { passive: false })
    commentButton.addEventListener('mousedown', handleCommentClick, { passive: false })
    commentButton.addEventListener('touchstart', handleCommentClick, { passive: false })
    commentButton.addEventListener('keydown', handleKeyDown)
    
    return () => {
      console.log('🧹 PostInteractionsV3: 댓글 네이티브 DOM 이벤트 리스너 제거')
      commentButton.removeEventListener('click', handleCommentClick)
      commentButton.removeEventListener('mousedown', handleCommentClick)
      commentButton.removeEventListener('touchstart', handleCommentClick)
      commentButton.removeEventListener('keydown', handleKeyDown)
    }
  }, [postId, toggleComments, isLoggedIn])
  
  // 북마크 토글 (기존 React 이벤트 방식 유지)
  const handleBookmark = async () => {
    if (!isLoggedIn) {
      toast.error('로그인이 필요합니다.')
      return
    }

    startBookmarkTransition(async () => {
      const previousBookmarked = isBookmarked
      setIsBookmarked(!isBookmarked)

      try {
        const result = await toggleBookmark(postId)
        
        if (result?.error) {
          setIsBookmarked(previousBookmarked)
          toast.error(result.error)
        } else {
          if (result?.bookmarked) {
            toast.success('📚 북마크에 저장했어요!')
          } else {
            toast.success('북마크에서 제거했어요.')
          }
        }
      } catch (error) {
        setIsBookmarked(previousBookmarked)
        toast.error('오류가 발생했습니다.')
      }
    })
  }
  
  // 컴팩트 버전
  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {/* 좋아요 버튼 (새 아키텍처) */}
          <div
            ref={likeButtonRef}
            className={`flex items-center space-x-1 p-2 rounded-full transition-colors cursor-pointer select-none touch-manipulation ${
              liked ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            role="button"
            tabIndex={0}
            aria-label={`좋아요 ${liked ? '취소' : '누르기'} - ${likesCount}개`}
            title={`좋아요 ${liked ? '취소' : '누르기'}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">{likesCount}</span>
          </div>
          
          {/* 댓글 버튼 */}
          <div
            ref={commentButtonRef}
            className={`flex items-center space-x-1 p-2 rounded-full transition-colors cursor-pointer select-none touch-manipulation ${
              commentsOpen ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            role="button"
            tabIndex={0}
            aria-label={`댓글 ${commentsOpen ? '닫기' : '열기'} - ${commentsCount}개`}
            title={`댓글 ${commentsOpen ? '닫기' : '열기'}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">{commentsCount}</span>
          </div>
          
          {/* 북마크 버튼 */}
          <button
            onClick={handleBookmark}
            disabled={isPendingBookmark}
            className={`p-2 rounded-full transition-colors touch-manipulation ${
              isBookmarked ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            } ${isPendingBookmark ? 'opacity-50' : ''}`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        <div className="text-xs text-gray-400">
          조회 {viewsCount.toLocaleString()}
        </div>
      </div>
    )
  }
  
  // 전체 버전
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <div className="flex items-center space-x-6">
        {/* 좋아요 버튼 (새 아키텍처) */}
        <div className="flex items-center space-x-2">
          <div
            ref={likeButtonRef}
            className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors cursor-pointer select-none min-h-[44px] touch-manipulation ${
              liked ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            role="button"
            tabIndex={0}
            aria-label={`좋아요 ${liked ? '취소' : '누르기'}`}
            title={`좋아요 ${liked ? '취소' : '누르기'}`}
            data-post-id={postId}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likesCount}</span>
          </div>
          
          {/* 좋아요 목록 보기 버튼 (새 기능) */}
          {showLikesModal && likesCount > 0 && (
            <div
              ref={likesListButtonRef}
              className="flex items-center space-x-1 px-2 py-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer select-none"
              role="button"
              tabIndex={0}
              aria-label={`좋아요 목록 보기 - ${likesCount}명`}
              title={`좋아요 목록 보기`}
            >
              <Users className="w-4 h-4" />
              <span className="text-xs">{likesCount}명</span>
            </div>
          )}
        </div>
        
        {/* 댓글 버튼 */}
        <div
          ref={commentButtonRef}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors cursor-pointer select-none min-h-[44px] touch-manipulation ${
            commentsOpen ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
          } border-2 border-dashed border-green-300`}
          role="button"
          tabIndex={0}
          aria-label={`댓글 ${commentsOpen ? '닫기' : '열기'} - 댓글 ${commentsCount}개`}
          title={`댓글 ${commentsOpen ? '닫기' : '열기'} (통합 V3)`}
          data-post-id={postId}
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm font-medium">{commentsCount}</span>
          <span className="text-xs bg-green-100 text-green-700 px-1 rounded">V3</span>
          {commentsOpen && <span className="text-xs ml-1">열림</span>}
        </div>
        
        {/* 북마크 버튼 */}
        <button
          onClick={handleBookmark}
          disabled={isPendingBookmark}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors min-h-[44px] touch-manipulation ${
            isBookmarked ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
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