'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useComments } from '@/contexts/comment-context'
import { CommentForm } from './comment-form'
import { CommentList } from './comment-list'
import { X } from 'lucide-react'

interface GlobalCommentSystemProps {
  currentUserId?: string
}

export function GlobalCommentSystem({ currentUserId }: GlobalCommentSystemProps) {
  const { commentState, closeComments, loadComments } = useComments()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  // 현재 열린 댓글 섹션 찾기
  const openCommentEntry = Object.entries(commentState).find(
    ([_, state]) => state.isOpen
  )
  
  if (!openCommentEntry) return null
  
  const [postId, state] = openCommentEntry
  
  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            댓글 ({state.comments?.length || 0})
          </h3>
          <button
            onClick={() => closeComments(postId)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="댓글 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ✨ 성능 최적화: 댓글 폼은 항상 표시, 로딩은 백그라운드에서 */}
          <CommentForm
            postId={postId}
            isLoggedIn={!!currentUserId}
            onSuccess={async () => {
              // 댓글 작성 성공 시 댓글 목록 새로고침
              console.log('댓글 작성 성공, 목록 새로고침 중...')
              await loadComments(postId)
            }}
          />
          
          {/* 댓글 목록 영역 */}
          {state.error ? (
            <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg border border-red-200">
              <p className="font-medium">댓글을 불러올 수 없습니다</p>
              <p className="text-sm mt-1">{state.error}</p>
            </div>
          ) : state.isLoading && (!state.comments || state.comments.length === 0) ? (
            /* 초기 로딩 시에만 스피너 표시 */
            <div className="text-center py-8 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-sm">댓글 불러오는 중...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {state.isLoading && (
                /* 기존 댓글이 있는 상태에서 업데이트 중일 때 작은 로딩 표시 */
                <div className="flex items-center justify-center py-2 text-gray-400 text-xs">
                  <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-blue-500 mr-2"></div>
                  업데이트 중...
                </div>
              )}
              
              <CommentList
                comments={state.comments || []}
                currentUserId={currentUserId}
                postId={postId}
                isLoggedIn={!!currentUserId}
              />
              
              {(!state.comments || state.comments.length === 0) && !state.isLoading && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}