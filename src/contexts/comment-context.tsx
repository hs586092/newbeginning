'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CommentWithProfile, CommentRPC } from '@/types/database.types'
import { useResilientAuth as useAuth } from '@/contexts/resilient-auth-context'
import { createClient } from '@/lib/supabase/client'
import { isValidForSupabase, getUUIDValidationError } from '@/lib/utils/uuid-validation'

interface CommentState {
  [postId: string]: {
    isOpen: boolean
    comments: CommentWithProfile[]
    isLoading: boolean
    error?: string
  }
}

interface CommentContextType {
  commentState: CommentState
  toggleComments: (postId: string) => Promise<void>
  loadComments: (postId: string) => Promise<void>
  addComment: (postId: string, comment: CommentWithProfile) => void
  closeComments: (postId: string) => void
  isCommentsOpen: (postId: string) => boolean
  getCommentsCount: (postId: string) => number
}

const CommentContext = createContext<CommentContextType | null>(null)

export function useComments() {
  const context = useContext(CommentContext)
  if (!context) {
    throw new Error('useComments must be used within CommentProvider')
  }
  return context
}

interface CommentProviderProps {
  children: ReactNode
}

export function CommentProvider({ children }: CommentProviderProps) {
  const [commentState, setCommentState] = useState<CommentState>({})
  const { user, isAuthenticated } = useAuth() // AuthContext에서 사용자 정보 가져오기
  const [supabase, setSupabase] = useState<any>(null)

  // 🚀 Supabase 클라이언트 지연 로딩
  const getSupabaseClient = useCallback(async () => {
    if (supabase) return supabase
    const client = await createClient()
    setSupabase(client)
    return client
  }, [supabase])
  
  const loadComments = useCallback(async (postId: string) => {
    console.log('🔄 CommentProvider: 댓글 로딩 시작', postId, { user: user?.id, isAuthenticated })
    
    // UUID 유효성 검사 with detailed logging
    if (!isValidForSupabase(postId)) {
      const error = getUUIDValidationError(postId)
      console.error('❌ CommentProvider: 유효하지 않은 UUID (로딩)', {
        postId: JSON.stringify(postId),
        postIdType: typeof postId,
        postIdLength: postId?.length,
        postIdKeys: typeof postId === 'object' ? Object.keys(postId) : 'N/A',
        postIdStringified: String(postId),
        error,
        stack: new Error().stack?.split('\n')[1]
      })
      return
    }
    
    setCommentState(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isLoading: true,
        error: undefined
      }
    }))
    
    try {
      
      const supabaseClient = await getSupabaseClient()

      // RPC 함수 호출로 변경
      const { data: comments, error } = await supabaseClient
        .rpc('get_post_comments', { p_post_id: postId })

      if (error) {
        throw error
      }
      
      // RPC 결과를 CommentWithProfile 형식으로 변환
      const convertedComments: CommentWithProfile[] = (comments as CommentRPC[])?.map(comment => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        author_name: comment.author_name,
        content: comment.content,
        parent_comment_id: comment.parent_comment_id,
        is_deleted: comment.is_deleted,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        profiles: {
          username: comment.profile_username || comment.author_name,
          avatar_url: comment.profile_avatar_url
        }
      })) || []
      
      console.log('✅ CommentProvider: 댓글 로딩 성공', convertedComments.length, '개')
      
      setCommentState(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          comments: convertedComments,
          isLoading: false,
          error: undefined
        }
      }))
      
    } catch (error) {
      console.error('❌ CommentProvider: 댓글 로딩 오류', error)
      setCommentState(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          comments: [],
          isLoading: false,
          error: error instanceof Error ? error.message : '댓글 로딩 실패'
        }
      }))
    }
  }, [getSupabaseClient, user?.id, isAuthenticated]) // supabase 및 인증 상태 의존성 추가
  
  const toggleComments = useCallback(async (postId: string) => {
    console.log('🔄 CommentProvider: 댓글 토글', postId)
    
    const currentState = commentState[postId]
    const isCurrentlyOpen = currentState?.isOpen || false
    
    if (!isCurrentlyOpen) {
      // ✨ 성능 최적화: 댓글 모달을 즉시 표시하고 동시에 데이터 로딩
      const hasComments = currentState?.comments?.length > 0
      
      // 모달 즉시 열기
      setCommentState(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          isOpen: true,
          comments: prev[postId]?.comments || [],
          isLoading: !hasComments // 기존 댓글이 있으면 로딩 상태 false
        }
      }))
      
      // 댓글이 없거나 업데이트가 필요하면 백그라운드에서 로딩
      if (!hasComments) {
        // 비동기적으로 댓글 로딩 (UI 블로킹 없음)
        loadComments(postId)
      }
    } else {
      // 댓글을 닫을 때
      setCommentState(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          isOpen: false
        }
      }))
    }
  }, [commentState, loadComments, user, isAuthenticated])
  
  const closeComments = useCallback((postId: string) => {
    setCommentState(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isOpen: false
      }
    }))
  }, [])
  
  const addComment = useCallback((postId: string, comment: CommentWithProfile) => {
    setCommentState(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        comments: [...(prev[postId]?.comments || []), comment]
      }
    }))
  }, [])
  
  const isCommentsOpen = useCallback((postId: string) => {
    return commentState[postId]?.isOpen || false
  }, [commentState])
  
  const getCommentsCount = useCallback((postId: string) => {
    return commentState[postId]?.comments?.length || 0
  }, [commentState])
  
  const contextValue: CommentContextType = {
    commentState,
    toggleComments,
    loadComments,
    addComment,
    closeComments,
    isCommentsOpen,
    getCommentsCount
  }
  
  return (
    <CommentContext.Provider value={contextValue}>
      {children}
    </CommentContext.Provider>
  )
}