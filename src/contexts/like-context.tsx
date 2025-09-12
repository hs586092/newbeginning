/**
 * 좋아요 시스템 Context Provider
 * 댓글 시스템의 성공 패턴을 좋아요 시스템에 적용
 */

'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { PostLikeWithProfile, PostLikeRPC, LikeToggleResponse } from '@/types/database.types'

// 1. 좋아요 상태 인터페이스
interface LikeState {
  [postId: string]: {
    isOpen: boolean
    likes: PostLikeWithProfile[]
    isLoading: boolean
    error?: string
    isLiked: boolean
    likesCount: number
  }
}

// 2. 좋아요 컨텍스트 타입
interface LikeContextType {
  likeState: LikeState
  toggleLike: (postId: string) => Promise<LikeToggleResponse | null>
  loadLikes: (postId: string) => Promise<void>
  isLiked: (postId: string) => boolean
  getLikesCount: (postId: string) => number
  openLikes: (postId: string) => Promise<void>
  closeLikes: (postId: string) => void
  isLikesOpen: (postId: string) => boolean
}

const LikeContext = createContext<LikeContextType | null>(null)

// 3. Hook
export function useLikes() {
  const context = useContext(LikeContext)
  if (!context) {
    throw new Error('useLikes must be used within LikeProvider')
  }
  return context
}

// 4. Provider Props
interface LikeProviderProps {
  children: ReactNode
}

// 5. Provider 구현
export function LikeProvider({ children }: LikeProviderProps) {
  const [likeState, setLikeState] = useState<LikeState>({})
  
  // Supabase 클라이언트 생성
  const getSupabaseClient = useCallback(async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase 환경변수가 설정되지 않았습니다')
    }
    
    return createClient(supabaseUrl, supabaseKey)
  }, [])
  
  // 현재 사용자 정보 가져오기
  const getCurrentUser = useCallback(async () => {
    const supabase = await getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }, [getSupabaseClient])
  
  // 좋아요 목록 로드
  const loadLikes = useCallback(async (postId: string) => {
    console.log('🔄 LikeProvider: 좋아요 로딩 시작', postId)
    
    setLikeState(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isLoading: true,
        error: undefined
      }
    }))
    
    try {
      const supabase = await getSupabaseClient()
      const user = await getCurrentUser()
      
      // RPC 함수 호출 (추후 생성 예정)
      const { data: likes, error } = await supabase
        .rpc('get_post_likes', { p_post_id: postId })

      if (error) {
        throw error
      }
      
      // RPC 결과를 PostLikeWithProfile 형식으로 변환
      const convertedLikes: PostLikeWithProfile[] = (likes as PostLikeRPC[])?.map(like => ({
        id: like.id,
        post_id: like.post_id,
        user_id: like.user_id,
        created_at: like.created_at,
        profiles: {
          username: like.profile_username || 'Anonymous',
          avatar_url: like.profile_avatar_url
        },
        posts: {
          title: like.post_title,
          category: like.post_category
        }
      })) || []
      
      // 현재 사용자의 좋아요 여부 확인
      const isLikedByUser = user ? convertedLikes.some(like => like.user_id === user.id) : false
      
      console.log('✅ LikeProvider: 좋아요 로딩 성공', convertedLikes.length, '개')
      
      setLikeState(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          likes: convertedLikes,
          isLoading: false,
          error: undefined,
          isLiked: isLikedByUser,
          likesCount: convertedLikes.length
        }
      }))
      
    } catch (error) {
      console.error('❌ LikeProvider: 좋아요 로딩 오류', error)
      setLikeState(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          likes: [],
          isLoading: false,
          error: error instanceof Error ? error.message : '좋아요 로딩 실패',
          isLiked: false,
          likesCount: 0
        }
      }))
    }
  }, [getSupabaseClient, getCurrentUser])
  
  // 좋아요 토글
  const toggleLike = useCallback(async (postId: string): Promise<LikeToggleResponse | null> => {
    console.log('🔄 LikeProvider: 좋아요 토글', postId)
    
    try {
      const supabase = await getSupabaseClient()
      const user = await getCurrentUser()
      
      if (!user) {
        throw new Error('로그인이 필요합니다')
      }
      
      const currentState = likeState[postId]
      const wasLiked = currentState?.isLiked || false
      
      // Optimistic update
      setLikeState(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          isLiked: !wasLiked,
          likesCount: wasLiked ? (prev[postId]?.likesCount || 1) - 1 : (prev[postId]?.likesCount || 0) + 1,
          likes: prev[postId]?.likes || [],
          isLoading: false
        }
      }))
      
      // RPC 함수 호출
      const { data, error } = await supabase.rpc('toggle_post_like', {
        p_post_id: postId,
        p_user_id: user.id
      })
      
      if (error) {
        // Revert optimistic update
        setLikeState(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            isLiked: wasLiked,
            likesCount: wasLiked ? (prev[postId]?.likesCount || 0) + 1 : (prev[postId]?.likesCount || 1) - 1
          }
        }))
        throw error
      }
      
      const result = data as LikeToggleResponse
      console.log('✅ LikeProvider: 좋아요 토글 성공', result)
      
      // 실제 결과로 상태 업데이트
      setLikeState(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          isLiked: result.liked,
          likesCount: result.like_count
        }
      }))
      
      return result
      
    } catch (error) {
      console.error('❌ LikeProvider: 좋아요 토글 오류', error)
      return null
    }
  }, [getSupabaseClient, getCurrentUser, likeState])
  
  // 좋아요 목록 열기
  const openLikes = useCallback(async (postId: string) => {
    console.log('🔄 LikeProvider: 좋아요 목록 열기', postId)
    
    const currentState = likeState[postId]
    
    setLikeState(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isOpen: true,
        likes: prev[postId]?.likes || [],
        isLoading: false,
        isLiked: prev[postId]?.isLiked || false,
        likesCount: prev[postId]?.likesCount || 0
      }
    }))
    
    // 좋아요 목록이 로드되지 않았다면 로드
    if (!currentState?.likes?.length) {
      await loadLikes(postId)
    }
  }, [likeState, loadLikes])
  
  // 좋아요 목록 닫기
  const closeLikes = useCallback((postId: string) => {
    setLikeState(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isOpen: false
      }
    }))
  }, [])
  
  // 현재 사용자의 좋아요 여부 확인
  const isLiked = useCallback((postId: string) => {
    return likeState[postId]?.isLiked || false
  }, [likeState])
  
  // 좋아요 수 조회
  const getLikesCount = useCallback((postId: string) => {
    return likeState[postId]?.likesCount || 0
  }, [likeState])
  
  // 좋아요 목록 열림 여부 확인
  const isLikesOpen = useCallback((postId: string) => {
    return likeState[postId]?.isOpen || false
  }, [likeState])
  
  const contextValue: LikeContextType = {
    likeState,
    toggleLike,
    loadLikes,
    isLiked,
    getLikesCount,
    openLikes,
    closeLikes,
    isLikesOpen
  }
  
  return (
    <LikeContext.Provider value={contextValue}>
      {children}
    </LikeContext.Provider>
  )
}