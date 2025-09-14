/**
 * 좋아요 버튼 컴포넌트
 * Native DOM Events 템플릿을 사용한 구현
 */

'use client'

import { useEffect, useRef } from 'react'
import { Heart, Users } from 'lucide-react'
import { useLikes } from '@/contexts/like-context'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

interface LikeButtonProps {
  postId: string
  initialLikesCount?: number
  variant?: 'default' | 'compact' | 'icon-only'
  showLikesModal?: boolean
  className?: string
}

export function LikeButton({
  postId,
  initialLikesCount = 0,
  variant = 'default',
  showLikesModal = true,
  className = ''
}: LikeButtonProps) {
  const { user, isAuthenticated } = useAuth() // AuthContext에서 직접 가져오기
  const { 
    toggleLike, 
    isLiked, 
    getLikesCount, 
    openLikes, 
    loadLikes 
  } = useLikes()
  
  const likeButtonRef = useRef<HTMLDivElement>(null)
  const likesListButtonRef = useRef<HTMLDivElement>(null)
  
  // 상태 값들
  const liked = isLiked(postId)
  const likesCount = getLikesCount(postId) || initialLikesCount
  
  // 컴포넌트 마운트 시 초기 상태 로드
  useEffect(() => {
    if (user?.id) {
      loadLikes(postId)
    }
  }, [postId, user?.id, loadLikes])
  
  // 좋아요 토글 Native DOM 이벤트 처리
  useEffect(() => {
    const likeButton = likeButtonRef.current
    if (!likeButton) return
    
    console.log('🔧 LikeButton: 네이티브 DOM 이벤트 리스너 등록 (좋아요 토글)')
    
    const handleLikeToggle = async (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
      
      console.log('🔥 LikeButton: 좋아요 토글 이벤트 발생!', postId)
      console.log('🔍 LikeButton: 인증 상태 확인', { 
        user: user?.id, 
        isAuthenticated, 
        email: user?.email 
      })
      
      if (!isAuthenticated) {
        console.error('❌ LikeButton: 인증되지 않은 사용자')
        toast.error('로그인이 필요합니다.')
        return
      }
      
      if (!user?.id) {
        console.error('❌ LikeButton: 사용자 ID가 없음')
        toast.error('사용자 정보를 가져올 수 없습니다.')
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
        console.error('❌ LikeButton: 좋아요 토글 오류', error)
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
      console.log('🧹 LikeButton: 네이티브 DOM 이벤트 리스너 제거 (좋아요 토글)')
      likeButton.removeEventListener('click', handleLikeToggle)
      likeButton.removeEventListener('mousedown', handleLikeToggle)
      likeButton.removeEventListener('touchstart', handleLikeToggle)
      likeButton.removeEventListener('keydown', handleKeyDown)
    }
  }, [postId, toggleLike, isAuthenticated])
  
  // 좋아요 목록 보기 Native DOM 이벤트 처리
  useEffect(() => {
    const likesListButton = likesListButtonRef.current
    if (!likesListButton || !showLikesModal) return
    
    console.log('🔧 LikeButton: 네이티브 DOM 이벤트 리스너 등록 (좋아요 목록)')
    
    const handleShowLikes = async (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
      
      console.log('🔥 LikeButton: 좋아요 목록 보기 이벤트 발생!', postId)
      
      if (likesCount === 0) {
        toast.info('아직 좋아요가 없습니다.')
        return
      }
      
      try {
        await openLikes(postId)
        console.log('✅ LikeButton: 좋아요 목록 열기 완료')
      } catch (error) {
        console.error('❌ LikeButton: 좋아요 목록 오류', error)
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
      console.log('🧹 LikeButton: 네이티브 DOM 이벤트 리스너 제거 (좋아요 목록)')
      likesListButton.removeEventListener('click', handleShowLikes)
      likesListButton.removeEventListener('keydown', handleKeyDown)
    }
  }, [postId, openLikes, showLikesModal, likesCount])
  
  // 컴팩트 버전
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div
          ref={likeButtonRef}
          className={`p-2 rounded-full transition-colors cursor-pointer select-none touch-manipulation ${
            liked
              ? 'bg-red-100 text-red-600'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          role="button"
          tabIndex={0}
          aria-label={`좋아요 ${liked ? '취소' : '누르기'}`}
          title={`좋아요 ${liked ? '취소' : '누르기'}`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
        </div>
        
        {showLikesModal && likesCount > 0 && (
          <div
            ref={likesListButtonRef}
            className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer select-none"
            role="button"
            tabIndex={0}
            aria-label={`좋아요 목록 보기 - ${likesCount}개`}
          >
            {likesCount}
          </div>
        )}
      </div>
    )
  }
  
  // 아이콘만 버전
  if (variant === 'icon-only') {
    return (
      <div
        ref={likeButtonRef}
        className={`p-2 rounded-full transition-colors cursor-pointer select-none touch-manipulation ${
          liked
            ? 'bg-red-100 text-red-600'
            : 'text-gray-500 hover:bg-gray-100'
        } ${className}`}
        role="button"
        tabIndex={0}
        aria-label={`좋아요 ${liked ? '취소' : '누르기'} - ${likesCount}개`}
        title={`좋아요 ${liked ? '취소' : '누르기'} - ${likesCount}개`}
      >
        <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
      </div>
    )
  }
  
  // 기본 버전
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* 좋아요 버튼 */}
      <div
        ref={likeButtonRef}
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors cursor-pointer select-none min-h-[44px] touch-manipulation ${
          liked
            ? 'bg-red-100 text-red-600'
            : 'text-gray-500 hover:bg-gray-100'
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
      
      {/* 좋아요 목록 보기 버튼 */}
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
  )
}