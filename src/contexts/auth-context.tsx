'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseAuthClient } from '@/lib/auth/supabase-client'
import { AuthStateMachine } from '@/lib/auth/auth-state-machine'
import { OperationMutex } from '@/lib/auth/operation-mutex'
import { 
  AuthMachineState, 
  AuthMachineEvent, 
  AuthMachineContext 
} from '@/types/auth-state-machine.types'
import type { 
  AuthConfig, 
  AuthResult,
  UserProfile,
  AuthEvent 
} from '@/types/auth.types'
import type { User, Session } from '@supabase/supabase-js'

// Enhanced Auth Context Value with State Machine
interface EnhancedAuthContextValue {
  // State Machine Properties
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  initialized: boolean
  currentState: AuthMachineState
  
  // Methods
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, username: string) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  signInWithKakao: () => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  updateProfile: (updates: Partial<UserProfile>) => Promise<AuthResult>
  refreshProfile: () => Promise<void>
  hasRole: (role: string) => boolean
  
  // State Machine Methods
  getMachineStatus: () => any
  canSignOut: () => boolean
}

// Create context
const AuthContext = createContext<EnhancedAuthContextValue | null>(null)

// Default configuration
const defaultConfig: AuthConfig = {
  redirectOnSignIn: '/',
  redirectOnSignOut: '/',
  enableDebugMode: process.env.NODE_ENV === 'development',
  autoRefreshProfile: true,
  storagePrefix: 'auth_'
}

interface AuthProviderProps {
  children: React.ReactNode
  config?: Partial<AuthConfig>
}

/**
 * Production-ready Auth Provider with State Machine Pattern
 * Single Source of Truth for all authentication states
 * Prevents race conditions and dual loading states
 */
export function AuthProvider({ children, config = {} }: AuthProviderProps) {
  const router = useRouter()
  const authClient = useRef<SupabaseAuthClient | null>(null)
  const stateMachine = useRef<AuthStateMachine | null>(null)
  const operationMutex = useRef<OperationMutex | null>(null)
  const initializationPromise = useRef<Promise<void> | null>(null)
  const finalConfig = { ...defaultConfig, ...config }

  // State Machine Context State
  const [machineContext, setMachineContext] = useState<AuthMachineContext>({
    user: null,
    profile: null,
    session: null,
    error: null,
    provider: null,
    oauthRetryCount: 0,
    lastError: null
  })
  
  const [currentState, setCurrentState] = useState<AuthMachineState>(AuthMachineState.INITIALIZING)

  // Initialize auth client, state machine, and operation mutex
  if (!authClient.current) {
    authClient.current = new SupabaseAuthClient(finalConfig.enableDebugMode)
  }

  if (!operationMutex.current) {
    operationMutex.current = new OperationMutex(finalConfig.enableDebugMode)
  }

  if (!stateMachine.current) {
    stateMachine.current = new AuthStateMachine({
      onStateChange: (state: AuthMachineState, context: AuthMachineContext) => {
        setCurrentState(state)
        setMachineContext(context)
      },
      onError: (error: string, context: AuthMachineContext) => {
        logError('State Machine Error:', error)
      },
      onUserChange: (user: User | null, context: AuthMachineContext) => {
        log('User changed:', user?.id || 'null')
        // Load profile if user exists and auto-refresh is enabled
        if (user && finalConfig.autoRefreshProfile) {
          loadProfile(user.id)
        }
      }
    }, finalConfig.enableDebugMode)
  }

  const log = useCallback((message: string, data?: any) => {
    if (finalConfig.enableDebugMode) {
      console.log(`[AuthContext] ${message}`, data || '')
    }
  }, [finalConfig.enableDebugMode])

  const logError = useCallback((message: string, error: any) => {
    console.error(`[AuthContext] ${message}`, error)
  }, [])

  /**
   * Load user profile
   */
  const loadProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      const { profile, error } = await authClient.current!.getUserProfile(userId)
      
      if (error) {
        logError('Failed to load profile:', error)
        return
      }

      // Profile will be updated through State Machine context
      log('Profile loaded successfully')
    } catch (error) {
      logError('Unexpected error loading profile:', error)
    }
  }, [log, logError])

  /**
   * Initialize authentication state with State Machine Pattern
   * Prevents race conditions and manages OAuth callbacks properly
   */
  const initializeAuth = useCallback(async (): Promise<void> => {
    if (initializationPromise.current) {
      return initializationPromise.current
    }

    initializationPromise.current = (async () => {
      try {
        log('Initializing authentication with State Machine')

        // Detect OAuth callback
        const isOAuthCallback = typeof window !== 'undefined' && 
          (window.location.href.includes('access_token=') ||
           window.location.search.includes('code=') ||
           window.location.search.includes('state='))

        if (isOAuthCallback) {
          log('OAuth callback detected - entering OAuth callback state')
          const provider = window.location.href.includes('kakao') ? 'kakao' : 'google'
          stateMachine.current!.send(AuthMachineEvent.OAUTH_CALLBACK_DETECTED, {
            provider,
            oauthRetryCount: 0
          })
          
          // Enhanced retry logic for OAuth scenarios
          await attemptOAuthAuthentication(provider as 'google' | 'kakao')
        } else {
          // Regular initialization - check for existing session
          await attemptRegularAuthentication()
        }

        log('Authentication initialization completed')
      } catch (error) {
        logError('Failed to initialize auth:', error)
        stateMachine.current!.send(AuthMachineEvent.SIGN_IN_ERROR, {
          error: '초기화 중 오류가 발생했습니다.',
          lastError: error instanceof Error ? error.message : String(error)
        })
      }
    })()

    return initializationPromise.current
  }, [log, logError])

  /**
   * Attempt OAuth authentication with provider-specific retry logic
   */
  const attemptOAuthAuthentication = useCallback(async (provider: 'google' | 'kakao') => {
    const maxRetries = provider === 'kakao' ? 5 : 3
    const retryDelay = provider === 'kakao' ? 800 : 500
    let retryCount = 0

    while (retryCount < maxRetries) {
      const [sessionResult, userResult] = await Promise.all([
        authClient.current!.getCurrentSession(),
        authClient.current!.getCurrentUser()
      ])

      if (sessionResult.session && userResult.user) {
        log(`OAuth authentication successful on attempt ${retryCount + 1}`, {
          provider,
          userId: userResult.user.id
        })
        
        stateMachine.current!.send(AuthMachineEvent.SIGN_IN_SUCCESS, {
          user: userResult.user,
          session: sessionResult.session,
          provider,
          oauthRetryCount: retryCount
        })
        return
      }

      if (retryCount < maxRetries - 1) {
        log(`OAuth retry ${retryCount + 1}/${maxRetries} for ${provider}`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
      
      retryCount++
    }

    // All retries failed
    stateMachine.current!.send(AuthMachineEvent.SIGN_IN_ERROR, {
      error: `${provider} 로그인 처리 중 시간이 초과되었습니다.`,
      provider,
      oauthRetryCount: retryCount
    })
  }, [log])

  /**
   * Attempt regular authentication for existing sessions
   */
  const attemptRegularAuthentication = useCallback(async () => {
    const [sessionResult, userResult] = await Promise.all([
      authClient.current!.getCurrentSession(),
      authClient.current!.getCurrentUser()
    ])

    if (sessionResult.session && userResult.user) {
      log('Existing session found')
      stateMachine.current!.send(AuthMachineEvent.SIGN_IN_SUCCESS, {
        user: userResult.user,
        session: sessionResult.session,
        provider: null
      })
    } else {
      log('No existing session found')
      stateMachine.current!.send(AuthMachineEvent.SIGN_IN_ERROR, {
        error: null // No error, just no session
      })
    }
  }, [log])

  /**
   * Handle auth state changes from Supabase
   * Now managed by State Machine Pattern
   */
  // Track current session to prevent duplicate processing
  const currentSessionRef = useRef<Session | null>(null)

  const handleAuthStateChange = useCallback(async (
    event: string, 
    session: Session | null
  ) => {
    log('Auth state changed:', { event, userId: session?.user?.id })

    // Prevent duplicate events by comparing session states
    const isSameSession = currentSessionRef.current?.access_token === session?.access_token
    const currentUserId = currentSessionRef.current?.user?.id
    const newUserId = session?.user?.id

    switch (event) {
      case 'SIGNED_IN':
        // Enhanced duplicate prevention
        const isAlreadyAuthenticated = stateMachine.current?.isAuthenticated()
        
        if (session?.user && (!isSameSession || currentUserId !== newUserId) && !isAlreadyAuthenticated) {
          // Only process if it's genuinely a new session AND we're not already authenticated
          currentSessionRef.current = session
          stateMachine.current!.send(AuthMachineEvent.SIGN_IN_SUCCESS, {
            user: session.user,
            session,
            provider: null // Will be set by the signin methods
          })
        } else {
          log('Ignoring duplicate/unnecessary SIGNED_IN event:', { 
            isSameSession, 
            isAlreadyAuthenticated, 
            currentState: stateMachine.current?.getCurrentState() 
          })
        }
        break

      case 'SIGNED_OUT':
        if (currentSessionRef.current) {
          // Only process sign out if we had a session
          currentSessionRef.current = null
          stateMachine.current!.send(AuthMachineEvent.SIGN_OUT_SUCCESS, {
            user: null,
            session: null,
            profile: null
          })
        }
        break

      case 'TOKEN_REFRESHED':
        // For token refresh, only update session reference, don't trigger state machine
        if (session?.user && (!isSameSession || currentUserId !== newUserId)) {
          log('Token refreshed - updating session reference only')
          currentSessionRef.current = session
        } else {
          log('Ignoring duplicate TOKEN_REFRESHED event')
        }
        break

      default:
        // Handle other events as needed
        break
    }
  }, [log, machineContext.provider])

  /**
   * Handle auth events from our custom client
   * Now managed by State Machine Pattern
   */
  const handleAuthEvent = useCallback((event: AuthEvent) => {
    log('Auth event received:', event.type)

    switch (event.type) {
      case 'SIGNED_OUT':
        stateMachine.current!.send(AuthMachineEvent.SIGN_OUT_SUCCESS, {
          user: null,
          session: null,
          profile: null
        })
        if (finalConfig.redirectOnSignOut && typeof window !== 'undefined') {
          // Force page reload to ensure complete state cleanup
          window.location.href = finalConfig.redirectOnSignOut
        }
        break

      case 'PROFILE_UPDATED':
        if (event.data?.profile) {
          // Update profile in state machine context
          setMachineContext(prev => ({
            ...prev,
            profile: event.data.profile
          }))
        }
        break

      case 'ERROR':
        logError('Auth event error:', event.error)
        break

      default:
        break
    }
  }, [log, logError, finalConfig.redirectOnSignOut])

  /**
   * Sign in with email and password using State Machine and Mutex
   */
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const SIGNIN_OPERATION = 'signin'

    // Prevent concurrent signin operations
    if (operationMutex.current!.isLocked(SIGNIN_OPERATION)) {
      return {
        success: false,
        error: '이미 로그인 진행 중입니다.'
      }
    }

    return await operationMutex.current!.withLock(SIGNIN_OPERATION, async () => {
      try {
        stateMachine.current!.send(AuthMachineEvent.SIGN_IN_START)
        
        const result = await authClient.current!.signInWithPassword(email, password)
        
        if (result.success) {
          stateMachine.current!.send(AuthMachineEvent.SIGN_IN_SUCCESS, {
            user: result.data?.user || null,
            session: result.data?.session || null,
            provider: 'email'
          })

          if (finalConfig.redirectOnSignIn) {
            router.push(finalConfig.redirectOnSignIn)
          }
        } else {
          stateMachine.current!.send(AuthMachineEvent.SIGN_IN_ERROR, {
            error: result.error || '로그인에 실패했습니다.',
            lastError: result.error
          })
        }
        
        return result
      } catch (error) {
        logError('Sign in error:', error)
        
        stateMachine.current!.send(AuthMachineEvent.SIGN_IN_ERROR, {
          error: '로그인 중 예기치 못한 오류가 발생했습니다.',
          lastError: error instanceof Error ? error.message : String(error)
        })

        return {
          success: false,
          error: '로그인 중 오류가 발생했습니다.'
        }
      }
    })
  }, [router, logError, finalConfig.redirectOnSignIn])

  /**
   * Sign up with email, password, and username using State Machine
   */
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    username: string
  ): Promise<AuthResult> => {
    try {
      // State Machine manages loading state automatically
      return await authClient.current!.signUpWithPassword(email, password, username)
    } catch (error) {
      logError('Sign up error:', error)
      return {
        success: false,
        error: '회원가입 중 오류가 발생했습니다.'
      }
    }
  }, [logError])

  /**
   * Sign in with Google using State Machine and Mutex
   */
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    const GOOGLE_SIGNIN_OPERATION = 'google-signin'

    if (operationMutex.current!.isLocked(GOOGLE_SIGNIN_OPERATION)) {
      return {
        success: false,
        error: '이미 Google 로그인 진행 중입니다.'
      }
    }

    return await operationMutex.current!.withLock(GOOGLE_SIGNIN_OPERATION, async () => {
      try {
        stateMachine.current!.send(AuthMachineEvent.SIGN_IN_START, {
          provider: 'google'
        })

        const result = await authClient.current!.signInWithGoogle()
        
        if (result.success && result.data?.url) {
          // OAuth redirect - State Machine will handle the callback
          window.location.href = result.data.url
        } else {
          stateMachine.current!.send(AuthMachineEvent.SIGN_IN_ERROR, {
            error: result.error || 'Google 로그인에 실패했습니다.',
            provider: 'google'
          })
        }
        
        return result
      } catch (error) {
        logError('Google sign in error:', error)
        
        stateMachine.current!.send(AuthMachineEvent.SIGN_IN_ERROR, {
          error: 'Google 로그인 중 예기치 못한 오류가 발생했습니다.',
          provider: 'google'
        })

        return {
          success: false,
          error: 'Google 로그인 중 오류가 발생했습니다.'
        }
      }
    })
  }, [logError])

  /**
   * Sign in with Kakao using State Machine and Mutex
   */
  const signInWithKakao = useCallback(async (): Promise<AuthResult> => {
    const KAKAO_SIGNIN_OPERATION = 'kakao-signin'

    if (operationMutex.current!.isLocked(KAKAO_SIGNIN_OPERATION)) {
      return {
        success: false,
        error: '이미 카카오 로그인 진행 중입니다.'
      }
    }

    return await operationMutex.current!.withLock(KAKAO_SIGNIN_OPERATION, async () => {
      try {
        stateMachine.current!.send(AuthMachineEvent.SIGN_IN_START, {
          provider: 'kakao'
        })

        const result = await authClient.current!.signInWithKakao()
        
        if (result.success && result.data?.url) {
          // OAuth redirect - State Machine will handle the callback
          window.location.href = result.data.url
        } else {
          stateMachine.current!.send(AuthMachineEvent.SIGN_IN_ERROR, {
            error: result.error || '카카오 로그인에 실패했습니다.',
            provider: 'kakao'
          })
        }
        
        return result
      } catch (error) {
        logError('Kakao sign in error:', error)
        
        stateMachine.current!.send(AuthMachineEvent.SIGN_IN_ERROR, {
          error: '카카오 로그인 중 예기치 못한 오류가 발생했습니다.',
          provider: 'kakao'
        })

        return {
          success: false,
          error: '카카오 로그인 중 오류가 발생했습니다.'
        }
      }
    })
  }, [logError])

  /**
   * Complete sign out with State Machine Pattern and Mutex
   * Prevents race conditions and concurrent signout operations
   */
  const signOut = useCallback(async (): Promise<AuthResult> => {
    const SIGNOUT_OPERATION = 'signout'

    // Check if signout is already in progress
    if (operationMutex.current!.isLocked(SIGNOUT_OPERATION)) {
      return {
        success: false,
        error: '이미 로그아웃 진행 중입니다.'
      }
    }

    return await operationMutex.current!.withLock(SIGNOUT_OPERATION, async () => {
      try {
        // Double check authentication state
        if (!stateMachine.current!.isAuthenticated()) {
          return {
            success: false,
            error: '이미 로그아웃 상태입니다.'
          }
        }

        log('Starting sign out process with State Machine and Mutex')
        stateMachine.current!.send(AuthMachineEvent.SIGN_OUT_START)
        
        const result = await authClient.current!.signOut()
        
        if (result.success) {
          stateMachine.current!.send(AuthMachineEvent.SIGN_OUT_SUCCESS, {
            user: null,
            session: null,
            profile: null,
            provider: null
          })
          
          // Navigate to landing page
          if (finalConfig.redirectOnSignOut && typeof window !== 'undefined') {
            window.location.href = finalConfig.redirectOnSignOut
          }
        } else {
          stateMachine.current!.send(AuthMachineEvent.SIGN_OUT_ERROR, {
            error: result.error || '로그아웃 중 오류가 발생했습니다.',
            lastError: result.error
          })
        }
        
        log('Sign out completed:', { success: result.success })
        return result
      } catch (error) {
        logError('Sign out error:', error)
        
        stateMachine.current!.send(AuthMachineEvent.SIGN_OUT_ERROR, {
          error: '로그아웃 중 예기치 못한 오류가 발생했습니다.',
          lastError: error instanceof Error ? error.message : String(error)
        })
        
        return {
          success: false,
          error: '로그아웃 중 오류가 발생했습니다.'
        }
      }
    })
  }, [log, logError, finalConfig.redirectOnSignOut])

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<AuthResult> => {
    if (!machineContext.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다.'
      }
    }

    try {
      return await authClient.current!.updateProfile(machineContext.user.id, updates)
    } catch (error) {
      logError('Update profile error:', error)
      return {
        success: false,
        error: '프로필 업데이트 중 오류가 발생했습니다.'
      }
    }
  }, [machineContext.user?.id, logError])

  /**
   * Refresh profile data
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (machineContext.user?.id) {
      await loadProfile(machineContext.user.id)
    }
  }, [machineContext.user?.id, loadProfile])

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: string): boolean => {
    if (!machineContext.profile) return false
    // Implement role checking logic based on your user schema
    return machineContext.profile.user_type === role
  }, [machineContext.profile])

  // ✅ CLAUDE.md 원칙: 단순함 우선 - 의존성 배열 제거로 무한 루프 방지
  useEffect(() => {
    initializeAuth()
  }, []) // 빈 의존성 배열 - 마운트 시에만 실행

  // Subscribe to auth state changes
  useEffect(() => {
    if (!authClient.current) return

    const { data: { subscription } } = authClient.current.onAuthStateChange(handleAuthStateChange)
    const unsubscribeFromEvents = authClient.current.onAuthEvent(handleAuthEvent)

    return () => {
      subscription.unsubscribe()
      unsubscribeFromEvents()
    }
  }, [handleAuthStateChange, handleAuthEvent])

  /**
   * Get machine status for debugging
   */
  const getMachineStatus = useCallback(() => {
    return stateMachine.current?.getStatus() || null
  }, [])

  /**
   * Check if user can sign out (prevent concurrent operations)
   */
  const canSignOut = useCallback((): boolean => {
    return (stateMachine.current?.isAuthenticated() || false) && 
           currentState !== AuthMachineState.SIGNING_OUT
  }, [currentState])

  // Context value with State Machine integration
  const value: EnhancedAuthContextValue = {
    // State Machine Properties
    user: machineContext.user,
    profile: machineContext.profile,
    session: machineContext.session,
    isAuthenticated: stateMachine.current?.isAuthenticated() || false,
    isLoading: stateMachine.current?.isLoading() || false,
    initialized: currentState !== AuthMachineState.INITIALIZING,
    currentState,
    
    // Methods
    signIn,
    signUp,
    signInWithGoogle,
    signInWithKakao,
    signOut,
    updateProfile,
    refreshProfile,
    hasRole,
    
    // State Machine Methods
    getMachineStatus,
    canSignOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use enhanced auth context with State Machine
 */
export function useAuth(): EnhancedAuthContextValue {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

/**
 * HOC to protect routes that require authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean
    redirectTo?: string
    requiredRole?: string
  } = {}
) {
  const {
    requireAuth = true,
    redirectTo = '/login',
    requiredRole
  } = options

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, hasRole, initialized } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!initialized || isLoading) return

      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo)
        return
      }

      if (requiredRole && (!isAuthenticated || !hasRole(requiredRole))) {
        router.push('/unauthorized')
        return
      }
    }, [isAuthenticated, isLoading, initialized, hasRole, router])

    if (!initialized || isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        </div>
      )
    }

    if (requireAuth && !isAuthenticated) {
      return null // Will redirect in useEffect
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return null // Will redirect in useEffect
    }

    return <Component {...props} />
  }
}