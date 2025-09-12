/**
 * 좋아요 시스템 Portal 컴포넌트
 * 댓글 시스템의 성공 패턴을 좋아요 시스템에 적용
 */

'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLikes } from '@/contexts/like-context'
import { LikeList } from './like-list'
import { X, Heart, Users } from 'lucide-react'

interface GlobalLikeSystemProps {
  currentUserId?: string
}

export function GlobalLikeSystem({ currentUserId }: GlobalLikeSystemProps) {
  const { likeState, closeLikes } = useLikes()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    // ESC 키로 닫기
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const openEntry = Object.entries(likeState).find(([_, state]) => state.isOpen)
        if (openEntry) {
          closeLikes(openEntry[0])
        }
      }
    }
    
    const hasOpen = Object.values(likeState).some(state => state.isOpen)
    if (hasOpen) {
      document.addEventListener('keydown', handleEscape)
      // 스크롤 방지
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [likeState, closeLikes])
  
  if (!mounted) return null
  
  // 현재 열린 좋아요 섹션 찾기
  const openLikeEntry = Object.entries(likeState).find(
    ([_, state]) => state.isOpen
  )
  
  if (!openLikeEntry) return null
  
  const [postId, state] = openLikeEntry
  
  return createPortal(
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
      onClick={() => closeLikes(postId)}
    >
      <div 
        className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            <h3 className="text-lg font-semibold text-gray-900">
              좋아요 ({state.likesCount || 0})
            </h3>
            {state.likesCount > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{state.likesCount}명이 좋아합니다</span>
              </div>
            )}
          </div>
          <button
            onClick={() => closeLikes(postId)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="좋아요 목록 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {state.error ? (
            <div className="text-center py-12 text-red-500 bg-red-50 m-4 rounded-lg border border-red-200">
              <Heart className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="font-medium">좋아요 목록을 불러올 수 없습니다</p>
              <p className="text-sm mt-1">{state.error}</p>
            </div>
          ) : state.isLoading && (!state.likes || state.likes.length === 0) ? (
            /* 초기 로딩 시에만 스피너 표시 */
            <div className="text-center py-12 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-red-500 mb-3"></div>
              <p className="text-sm">좋아요 목록 불러오는 중...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {state.isLoading && (
                /* 기존 좋아요가 있는 상태에서 업데이트 중일 때 작은 로딩 표시 */
                <div className="flex items-center justify-center py-2 text-gray-400 text-xs border-b border-gray-100">
                  <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-red-500 mr-2"></div>
                  업데이트 중...
                </div>
              )}
              
              {state.likes && state.likes.length > 0 ? (
                <LikeList
                  likes={state.likes}
                  currentUserId={currentUserId}
                  postId={postId}
                />
              ) : !state.isLoading ? (
                <div className="text-center py-12 text-gray-500">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">아직 좋아요가 없습니다</p>
                  <p className="text-sm text-gray-400">첫 번째 좋아요를 눌러보세요!</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {state.likes && state.likes.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <div className="text-center text-sm text-gray-500">
              {state.likesCount}명이 이 게시글을 좋아합니다
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}