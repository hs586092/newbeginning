'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { UnifiedFeed } from '@/components/feed/unified-feed'
import { SearchBar } from '@/components/search/search-bar'
import { TrendingUp, AlertCircle, Database, Wifi, WifiOff, Bell } from 'lucide-react'
import { postService } from '@/lib/services/post-service'
import { UnifiedPost } from '@/lib/data/post-transformer'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { LeftSidebar } from '@/components/layout/left-sidebar'
import { RightSidebar } from '@/components/layout/right-sidebar'
import { useRealtimePosts } from '@/hooks/use-realtime'

interface RealisticHomepageProps {
  searchParams: { [key: string]: string | undefined }
}

// Data state for posts management
interface DataState {
  posts: UnifiedPost[]
  isLoading: boolean
  error?: string
  source: 'database' | 'fallback'
  connectionStatus: 'connected' | 'disconnected' | 'checking'
}

export function RealisticHomepage({ searchParams }: RealisticHomepageProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [dataState, setDataState] = useState<DataState>({
    posts: [],
    isLoading: true,
    source: 'database',
    connectionStatus: 'checking'
  })

  console.log('🏠 RealisticHomepage rendered:', {
    mounted,
    postsCount: dataState.posts.length,
    isLoading: dataState.isLoading,
    isAuthenticated,
    source: dataState.source,
    connectionStatus: dataState.connectionStatus,
    error: dataState.error
  })

  // Handle real-time post updates
  const handleRealtimePostUpdate = useCallback((update: any) => {
    console.log('🔄 Real-time post update:', update)

    if (update.eventType === 'INSERT') {
      // Add new post to the beginning of the list
      setDataState(prev => ({
        ...prev,
        posts: [update.post, ...prev.posts]
      }))
    } else if (update.eventType === 'UPDATE') {
      // Update existing post
      setDataState(prev => ({
        ...prev,
        posts: prev.posts.map(post =>
          post.id === update.post.id ? { ...post, ...update.post } : post
        )
      }))
    } else if (update.eventType === 'DELETE') {
      // Remove deleted post
      setDataState(prev => ({
        ...prev,
        posts: prev.posts.filter(post => post.id !== update.post.id)
      }))
    }
  }, [])

  // Load posts with proper error handling and fallback
  useEffect(() => {
    if (!mounted) return

    const loadPosts = async () => {
      try {
        setDataState(prev => ({ ...prev, isLoading: true, connectionStatus: 'checking' }))

        console.log('🔍 Loading posts from database...')

        // Test connection first
        const connectionTest = await postService.testConnection()

        if (!connectionTest.success) {
          console.warn('⚠️ Database connection failed:', connectionTest.error)
          setDataState({
            posts: [],
            isLoading: false,
            error: connectionTest.error,
            source: 'fallback',
            connectionStatus: 'disconnected'
          })
          return
        }

        console.log(`✅ Database connection successful (${connectionTest.latency}ms)`)

        // Load actual posts
        const result = await postService.getPosts(20)

        setDataState({
          posts: result.data,
          isLoading: false,
          error: result.error,
          source: result.source,
          connectionStatus: result.source === 'database' ? 'connected' : 'disconnected'
        })

        console.log(`📝 Loaded ${result.data.length} posts from ${result.source}`)

      } catch (error) {
        console.error('🚨 Failed to load posts:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        setDataState({
          posts: [],
          isLoading: false,
          error: errorMessage,
          source: 'fallback',
          connectionStatus: 'disconnected'
        })
      }
    }

    loadPosts()
  }, [mounted])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Set up real-time post subscription
  useRealtimePosts(handleRealtimePostUpdate, isAuthenticated && dataState.connectionStatus === 'connected')

  // Loading state
  if (!mounted || dataState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {dataState.connectionStatus === 'checking' ? '데이터베이스 연결 확인 중...' : '로딩중...'}
          </p>
        </div>
      </div>
    )
  }

  // Database connection status indicator
  const ConnectionIndicator = () => {
    if (dataState.source === 'database' && dataState.connectionStatus === 'connected') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
          <Database className="w-3 h-3" />
          데이터베이스 연결됨
        </div>
      )
    }

    if (dataState.connectionStatus === 'disconnected') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
          <WifiOff className="w-3 h-3" />
          연결 문제 감지됨
        </div>
      )
    }

    return null
  }

  // Error state with detailed information
  if (dataState.error && dataState.posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            데이터 연결 문제
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            현재 게시글을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
          </p>
          <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
            오류: {dataState.error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 모바일용 왼쪽 사이드바 콘텐츠 */}
        <div className="lg:hidden mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LeftSidebar />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 왼쪽 사이드바 - 모바일에서는 숨김 */}
          <div className="hidden lg:block lg:col-span-1">
            <LeftSidebar />
          </div>

          {/* 메인 게시글 영역 */}
          <div className="lg:col-span-3">
            {/* 검색 기능 */}
            <div className="mb-6">
              <SearchBar
                totalPosts={dataState.posts.length}
                showFilters={true}
                className=""
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                    인기 게시글
                  </h2>
                  <div className="flex items-center gap-3">
                    <ConnectionIndicator />
                    {isAuthenticated && <NotificationBell />}
                    <span className="text-sm text-gray-500">실시간 업데이트</span>
                  </div>
                </div>

                {/* Error banner for partial failures */}
                {dataState.error && dataState.posts.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        일부 게시글을 불러올 수 없습니다. ({dataState.error})
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* UnifiedFeed 컴포넌트 사용 */}
              <UnifiedFeed
                posts={dataState.posts}
                isLoading={dataState.isLoading}
                isAuthenticated={isAuthenticated}
                currentUserId={user?.id}
                variant="dashboard"
                selectedCategory="all"
                activeFilter="all"
                smartFilter="latest"
              />

              {/* No posts message */}
              {!dataState.isLoading && dataState.posts.length === 0 && (
                <div className="p-8 text-center">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    게시글이 없습니다
                  </h3>
                  <p className="text-gray-500 text-sm">
                    새로운 게시글이 등록되면 여기에 표시됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="lg:col-span-1">
            <RightSidebar dataState={dataState} />
          </div>
        </div>
      </div>
    </div>
  )
}