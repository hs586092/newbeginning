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
  const { commentState, closeComments } = useComments()
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
          {state.isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2">댓글 로딩 중...</p>
            </div>
          ) : state.error ? (
            <div className="text-center py-8 text-red-500">
              <p>댓글 로딩 실패: {state.error}</p>
            </div>
          ) : (
            <>
              <CommentForm 
                postId={postId} 
                isLoggedIn={!!currentUserId}
                onSuccess={() => {
                  // 댓글 작성 성공 시 새로고침은 CommentProvider에서 처리
                  console.log('댓글 작성 성공')
                }}
              />
              
              <CommentList
                comments={state.comments || []}
                currentUserId={currentUserId}
                postId={postId}
                isLoggedIn={!!currentUserId}
              />
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}