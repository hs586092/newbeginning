/**
 * 베이스 Portal 템플릿
 * 댓글 시스템의 성공 패턴을 기반으로 한 재사용 가능한 Portal 컴포넌트 템플릿
 */

'use client'

import { useEffect, useState, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// 1. 기본 Portal Props 인터페이스
interface BasePortalProps<T> {
  isOpen: boolean
  onClose: () => void
  title: string
  data: T[]
  isLoading: boolean
  error?: string
  renderContent: (data: T[], onClose: () => void) => ReactNode
  className?: string
  maxWidth?: string
  maxHeight?: string
}

// 2. Portal 컴포넌트 생성 함수
export function createPortalComponent<T>() {
  return function Portal({
    isOpen,
    onClose,
    title,
    data,
    isLoading,
    error,
    renderContent,
    className = '',
    maxWidth = 'max-w-2xl',
    maxHeight = 'max-h-[85vh]'
  }: BasePortalProps<T>) {
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
      setMounted(true)
    }, [])
    
    useEffect(() => {
      if (isOpen) {
        // 스크롤 방지
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
      
      return () => {
        document.body.style.overflow = ''
      }
    }, [isOpen])
    
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose()
        }
      }
      
      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
      }
    }, [isOpen, onClose])
    
    if (!mounted || !isOpen) return null
    
    return createPortal(
      <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
        <div 
          className={`bg-white rounded-t-xl sm:rounded-xl w-full ${maxWidth} ${maxHeight} flex flex-col shadow-2xl ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {title} ({data?.length || 0})
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2">로딩 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>로딩 실패: {error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 text-blue-600 hover:underline"
                >
                  다시 시도
                </button>
              </div>
            ) : (
              renderContent(data, onClose)
            )}
          </div>
        </div>
      </div>,
      document.body
    )
  }
}

// 3. 전역 Portal 시스템 템플릿
interface GlobalPortalSystemProps<T, S> {
  contextHook: () => S  // useComments, useLikes 등
  getOpenEntry: (state: S) => [string, any] | null  // 열린 항목 찾기 함수
  renderContent: (id: string, data: any, onClose: (id: string) => void) => ReactNode
  title: string
  currentUserId?: string
}

export function createGlobalPortalSystem<T, S>() {
  return function GlobalPortalSystem({
    contextHook,
    getOpenEntry,
    renderContent,
    title,
    currentUserId
  }: GlobalPortalSystemProps<T, S>) {
    const contextState = contextHook()
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
      setMounted(true)
    }, [])
    
    if (!mounted) return null
    
    const openEntry = getOpenEntry(contextState)
    if (!openEntry) return null
    
    const [id, state] = openEntry
    
    return createPortal(
      <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {title} ({state.items?.length || 0})
            </h3>
            <button
              onClick={() => (contextState as any).close(id)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {state.isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2">로딩 중...</p>
              </div>
            ) : state.error ? (
              <div className="text-center py-8 text-red-500">
                <p>로딩 실패: {state.error}</p>
              </div>
            ) : (
              renderContent(id, state, (contextState as any).close)
            )}
          </div>
        </div>
      </div>,
      document.body
    )
  }
}

// 4. 사용 예시 (댓글 시스템 재구현)
/*
import { CommentForm } from '@/components/comments/comment-form'
import { CommentList } from '@/components/comments/comment-list'
import { useComments } from '@/contexts/comment-context'

const CommentPortal = createGlobalPortalSystem<CommentWithProfile, any>()

export function GlobalCommentSystem({ currentUserId }: { currentUserId?: string }) {
  return (
    <CommentPortal
      contextHook={useComments}
      getOpenEntry={(state) => 
        Object.entries(state.commentState).find(([_, s]) => s.isOpen) || null
      }
      renderContent={(postId, state, onClose) => (
        <>
          <CommentForm 
            postId={postId} 
            isLoggedIn={!!currentUserId}
            onSuccess={() => console.log('댓글 작성 성공')}
          />
          <CommentList
            comments={state.comments || []}
            currentUserId={currentUserId}
            postId={postId}
            isLoggedIn={!!currentUserId}
          />
        </>
      )}
      title="댓글"
      currentUserId={currentUserId}
    />
  )
}
*/