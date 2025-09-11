'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CommentWithProfile, CommentRPC } from '@/types/database.types'

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
  
  const loadComments = useCallback(async (postId: string) => {
    console.log('🔄 CommentProvider: 댓글 로딩 시작', postId)
    
    setCommentState(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isLoading: true,
        error: undefined
      }
    }))
    
    try {
      // 클라이언트 Supabase 인스턴스 생성
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase 환경변수가 설정되지 않았습니다')
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // RPC 함수 호출로 변경
      const { data: comments, error } = await supabase
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
  }, [])
  
  const toggleComments = useCallback(async (postId: string) => {
    console.log('🔄 CommentProvider: 댓글 토글', postId)
    
    const currentState = commentState[postId]
    const isCurrentlyOpen = currentState?.isOpen || false
    
    if (!isCurrentlyOpen) {
      // 댓글을 열 때
      setCommentState(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          isOpen: true,
          comments: prev[postId]?.comments || [],
          isLoading: false
        }
      }))
      
      // 댓글이 로드되지 않았다면 로드
      if (!currentState?.comments?.length) {
        await loadComments(postId)
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
  }, [commentState, loadComments])
  
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