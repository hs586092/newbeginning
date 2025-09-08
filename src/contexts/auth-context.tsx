'use client'

import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  useCallback,
  useRef
} from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseAuthClient } from '@/lib/auth/supabase-client'
import type { 
  AuthState, 
  AuthContextValue, 
  AuthConfig, 
  AuthResult,
  UserProfile,
  AuthEvent 
} from '@/types/auth.types'
import type { User, Session } from '@supabase/supabase-js'

// Auth Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User | null; session: Session | null } }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'RESET_STATE' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }

// Initial state
const initialState: AuthState = {
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false
}

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload }
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        loading: false
      }
    
    case 'SET_PROFILE':
      return { ...state, profile: action.payload }
    
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile 
          ? { ...state.profile, ...action.payload }
          : null
      }
    
    case 'RESET_STATE':
      return {
        user: null,
        profile: null,
        session: null,
        loading: false,
        initialized: true
      }
    
    default:
      return state
  }
}

// Create context
const AuthContext = createContext<AuthContextValue | null>(null)

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
 * Production-ready Auth Provider with comprehensive state management
 */
export function AuthProvider({ children, config = {} }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()
  const authClient = useRef<SupabaseAuthClient | null>(null)
  const initializationPromise = useRef<Promise<void> | null>(null)
  const finalConfig = { ...defaultConfig, ...config }

  // Initialize auth client
  if (!authClient.current) {
    authClient.current = new SupabaseAuthClient(finalConfig.enableDebugMode)
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

      dispatch({ type: 'SET_PROFILE', payload: profile })
      log('Profile loaded successfully')
    } catch (error) {
      logError('Unexpected error loading profile:', error)
    }
  }, [log, logError])

  /**
   * Initialize authentication state
   */
  const initializeAuth = useCallback(async (): Promise<void> => {
    if (initializationPromise.current) {
      return initializationPromise.current
    }

    initializationPromise.current = (async () => {
      try {
        log('Initializing authentication state')
        dispatch({ type: 'SET_LOADING', payload: true })

        // Get current session and user
        const [{ session }, { user }] = await Promise.all([
          authClient.current!.getCurrentSession(),
          authClient.current!.getCurrentUser()
        ])

        if (session && user) {
          log('Found existing session and user')
          dispatch({ 
            type: 'SET_USER', 
            payload: { user, session } 
          })

          // Load profile if auto-refresh is enabled
          if (finalConfig.autoRefreshProfile) {
            await loadProfile(user.id)
          }
        } else {
          log('No existing session found')
          dispatch({ type: 'RESET_STATE' })
        }

        dispatch({ type: 'SET_INITIALIZED', payload: true })
        log('Authentication initialization completed')
      } catch (error) {
        logError('Failed to initialize auth:', error)
        dispatch({ type: 'RESET_STATE' })
        dispatch({ type: 'SET_INITIALIZED', payload: true })
      }
    })()

    return initializationPromise.current
  }, [log, logError, loadProfile, finalConfig.autoRefreshProfile])

  /**
   * Handle auth state changes from Supabase
   */
  const handleAuthStateChange = useCallback(async (
    event: string, 
    session: Session | null
  ) => {
    log('Auth state changed:', { event, userId: session?.user?.id })

    switch (event) {
      case 'SIGNED_IN':
        if (session?.user) {
          dispatch({ 
            type: 'SET_USER', 
            payload: { user: session.user, session } 
          })
          
          if (finalConfig.autoRefreshProfile) {
            await loadProfile(session.user.id)
          }
        }
        break

      case 'SIGNED_OUT':
        dispatch({ type: 'RESET_STATE' })
        break

      case 'TOKEN_REFRESHED':
        if (session?.user) {
          dispatch({ 
            type: 'SET_USER', 
            payload: { user: session.user, session } 
          })
        }
        break

      default:
        // Handle other events as needed
        break
    }
  }, [log, loadProfile, finalConfig.autoRefreshProfile])

  /**
   * Handle auth events from our custom client
   */
  const handleAuthEvent = useCallback((event: AuthEvent) => {
    log('Auth event received:', event.type)

    switch (event.type) {
      case 'SIGNED_OUT':
        dispatch({ type: 'RESET_STATE' })
        if (finalConfig.redirectOnSignOut && typeof window !== 'undefined') {
          // Force page reload to ensure complete state cleanup
          window.location.href = finalConfig.redirectOnSignOut
        }
        break

      case 'PROFILE_UPDATED':
        if (event.data?.profile) {
          dispatch({ type: 'SET_PROFILE', payload: event.data.profile })
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
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const result = await authClient.current!.signInWithPassword(email, password)
      
      if (result.success && finalConfig.redirectOnSignIn) {
        router.push(finalConfig.redirectOnSignIn)
      }
      
      return result
    } catch (error) {
      logError('Sign in error:', error)
      return {
        success: false,
        error: '로그인 중 오류가 발생했습니다.'
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [router, logError, finalConfig.redirectOnSignIn])

  /**
   * Sign up with email, password, and username
   */
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    username: string
  ): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      return await authClient.current!.signUpWithPassword(email, password, username)
    } catch (error) {
      logError('Sign up error:', error)
      return {
        success: false,
        error: '회원가입 중 오류가 발생했습니다.'
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [logError])

  /**
   * Sign in with Google
   */
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    try {
      const result = await authClient.current!.signInWithGoogle()
      
      if (result.success && result.data?.url) {
        window.location.href = result.data.url
      }
      
      return result
    } catch (error) {
      logError('Google sign in error:', error)
      return {
        success: false,
        error: 'Google 로그인 중 오류가 발생했습니다.'
      }
    }
  }, [logError])

  /**
   * Sign in with Kakao
   */
  const signInWithKakao = useCallback(async (): Promise<AuthResult> => {
    try {
      const result = await authClient.current!.signInWithKakao()
      
      if (result.success && result.data?.url) {
        window.location.href = result.data.url
      }
      
      return result
    } catch (error) {
      logError('Kakao sign in error:', error)
      return {
        success: false,
        error: '카카오 로그인 중 오류가 발생했습니다.'
      }
    }
  }, [logError])

  /**
   * Complete sign out with comprehensive cleanup
   */
  const signOut = useCallback(async (): Promise<AuthResult> => {
    try {
      log('Starting sign out process')
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const result = await authClient.current!.signOut()
      
      // State will be reset by handleAuthEvent
      log('Sign out completed:', { success: result.success })
      
      return result
    } catch (error) {
      logError('Sign out error:', error)
      return {
        success: false,
        error: '로그아웃 중 오류가 발생했습니다.'
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [log, logError])

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<AuthResult> => {
    if (!state.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다.'
      }
    }

    try {
      return await authClient.current!.updateProfile(state.user.id, updates)
    } catch (error) {
      logError('Update profile error:', error)
      return {
        success: false,
        error: '프로필 업데이트 중 오류가 발생했습니다.'
      }
    }
  }, [state.user?.id, logError])

  /**
   * Refresh profile data
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (state.user?.id) {
      await loadProfile(state.user.id)
    }
  }, [state.user?.id, loadProfile])

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: string): boolean => {
    if (!state.profile) return false
    // Implement role checking logic based on your user schema
    return state.profile.user_type === role
  }, [state.profile])

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

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

  // Context value
  const value: AuthContextValue = {
    // State
    ...state,
    
    // Derived state
    isAuthenticated: !!state.user && !!state.session,
    isLoading: state.loading,
    
    // Methods
    signIn,
    signUp,
    signInWithGoogle,
    signInWithKakao,
    signOut,
    updateProfile,
    refreshProfile,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextValue {
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
    }, [isAuthenticated, isLoading, initialized, router])

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