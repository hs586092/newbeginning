/**
 * 베이스 Provider 템플릿
 * 댓글 시스템의 성공 패턴을 기반으로 한 재사용 가능한 Context Provider 템플릿
 */

'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// 1. 기본 State 인터페이스 템플릿
interface BaseState<T> {
  [id: string]: {
    isOpen: boolean
    items: T[]
    isLoading: boolean
    error?: string
    metadata?: Record<string, any>
  }
}

// 2. 기본 Context 타입 템플릿
interface BaseContextType<T> {
  state: BaseState<T>
  toggle: (id: string) => Promise<void>
  load: (id: string) => Promise<void>
  add: (id: string, item: T) => void
  close: (id: string) => void
  isOpen: (id: string) => boolean
  getCount: (id: string) => number
  updateItem: (id: string, itemId: string, updates: Partial<T>) => void
  removeItem: (id: string, itemId: string) => void
}

// 3. RPC 호출 설정 인터페이스
interface RPCConfig<T> {
  loadFunction: string  // 'get_post_comments'
  createFunction?: string  // 'create_comment'
  updateFunction?: string  // 'update_comment'
  deleteFunction?: string  // 'delete_comment'
  toggleFunction?: string  // 'toggle_comment_like'
  dataConverter: (rpcData: any[]) => T[]  // RPC 결과를 원하는 타입으로 변환
}

// 4. Provider Props 템플릿
interface BaseProviderProps<T> {
  children: ReactNode
  rpcConfig: RPCConfig<T>
  contextName: string  // 에러 메시지용
}

// 5. Hook 생성 함수 템플릿
export function createContextHook<T>(contextName: string) {
  return function useContext(context: React.Context<BaseContextType<T> | null>) {
    const ctx = useContext(context)
    if (!ctx) {
      throw new Error(`use${contextName} must be used within ${contextName}Provider`)
    }
    return ctx
  }
}

// 6. Provider 생성 함수 템플릿
export function createProvider<T extends { id: string }>(
  rpcConfig: RPCConfig<T>,
  contextName: string
) {
  const Context = createContext<BaseContextType<T> | null>(null)
  
  function Provider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<BaseState<T>>({})
    
    // Supabase 클라이언트 초기화
    const getSupabaseClient = useCallback(async () => {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase 환경변수가 설정되지 않았습니다')
      }
      
      return createClient(supabaseUrl, supabaseKey)
    }, [])
    
    // 데이터 로드 함수
    const load = useCallback(async (id: string) => {
      console.log(`🔄 ${contextName}Provider: 데이터 로딩 시작`, id)
      
      setState(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          isLoading: true,
          error: undefined
        }
      }))
      
      try {
        const supabase = await getSupabaseClient()
        
        const { data, error } = await supabase
          .rpc(rpcConfig.loadFunction, { [`p_${id.includes('post') ? 'post' : 'user'}_id`]: id })

        if (error) {
          throw error
        }
        
        const convertedData = rpcConfig.dataConverter(data || [])
        
        console.log(`✅ ${contextName}Provider: 데이터 로딩 성공`, convertedData.length, '개')
        
        setState(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            items: convertedData,
            isLoading: false,
            error: undefined
          }
        }))
        
      } catch (error) {
        console.error(`❌ ${contextName}Provider: 데이터 로딩 오류`, error)
        setState(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            items: [],
            isLoading: false,
            error: error instanceof Error ? error.message : '데이터 로딩 실패'
          }
        }))
      }
    }, [getSupabaseClient, rpcConfig.loadFunction, rpcConfig.dataConverter, contextName])
    
    // 토글 함수
    const toggle = useCallback(async (id: string) => {
      console.log(`🔄 ${contextName}Provider: 토글`, id)
      
      const currentState = state[id]
      const isCurrentlyOpen = currentState?.isOpen || false
      
      if (!isCurrentlyOpen) {
        // 열기
        setState(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            isOpen: true,
            items: prev[id]?.items || [],
            isLoading: false
          }
        }))
        
        // 데이터가 없다면 로드
        if (!currentState?.items?.length) {
          await load(id)
        }
      } else {
        // 닫기
        setState(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            isOpen: false
          }
        }))
      }
    }, [state, load, contextName])
    
    // 아이템 추가
    const add = useCallback((id: string, item: T) => {
      setState(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          items: [...(prev[id]?.items || []), item]
        }
      }))
    }, [])
    
    // 닫기
    const close = useCallback((id: string) => {
      setState(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          isOpen: false
        }
      }))
    }, [])
    
    // 상태 확인
    const isOpen = useCallback((id: string) => {
      return state[id]?.isOpen || false
    }, [state])
    
    // 개수 확인
    const getCount = useCallback((id: string) => {
      return state[id]?.items?.length || 0
    }, [state])
    
    // 아이템 업데이트
    const updateItem = useCallback((id: string, itemId: string, updates: Partial<T>) => {
      setState(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          items: prev[id]?.items?.map(item => 
            item.id === itemId ? { ...item, ...updates } : item
          ) || []
        }
      }))
    }, [])
    
    // 아이템 제거
    const removeItem = useCallback((id: string, itemId: string) => {
      setState(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          items: prev[id]?.items?.filter(item => item.id !== itemId) || []
        }
      }))
    }, [])
    
    const contextValue: BaseContextType<T> = {
      state,
      toggle,
      load,
      add,
      close,
      isOpen,
      getCount,
      updateItem,
      removeItem
    }
    
    return (
      <Context.Provider value={contextValue}>
        {children}
      </Context.Provider>
    )
  }
  
  // Hook 생성
  function useHook() {
    const context = useContext(Context)
    if (!context) {
      throw new Error(`use${contextName} must be used within ${contextName}Provider`)
    }
    return context
  }
  
  return { Provider, useHook, Context }
}

// 7. 사용 예시 (댓글 시스템 재구현)
/*
import { CommentWithProfile, CommentRPC } from '@/types/database.types'

const commentRPCConfig: RPCConfig<CommentWithProfile> = {
  loadFunction: 'get_post_comments',
  createFunction: 'create_comment',
  updateFunction: 'update_comment',
  deleteFunction: 'delete_comment',
  dataConverter: (data: CommentRPC[]) => 
    data.map(comment => ({
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
    }))
}

export const { 
  Provider: CommentProvider, 
  useHook: useComments, 
  Context: CommentContext 
} = createProvider<CommentWithProfile>(commentRPCConfig, 'Comment')
*/