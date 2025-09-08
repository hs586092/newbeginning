import type { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  username: string
  email: string
  avatar_url?: string
  user_type?: 'pregnant' | 'new_mom' | 'growing_mom' | 'experienced'
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: SupabaseUser | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

export interface AuthContextValue extends AuthState {
  // Authentication methods
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, username: string) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  signInWithKakao: () => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  
  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<AuthResult>
  refreshProfile: () => Promise<void>
  
  // Utility methods
  isAuthenticated: boolean
  isLoading: boolean
  hasRole: (role: string) => boolean
}

export interface AuthResult {
  success: boolean
  error?: string
  data?: any
}

export interface AuthConfig {
  redirectOnSignIn?: string
  redirectOnSignOut?: string
  enableDebugMode?: boolean
  autoRefreshProfile?: boolean
  storagePrefix?: string
}

export type AuthEventType = 
  | 'SIGNED_IN' 
  | 'SIGNED_OUT' 
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PROFILE_UPDATED'
  | 'ERROR'

export interface AuthEvent {
  type: AuthEventType
  data?: any
  error?: AuthError | Error
  timestamp: number
}

export type AuthEventHandler = (event: AuthEvent) => void

// Storage cleanup interface
export interface StorageCleanupResult {
  localStorage: boolean
  sessionStorage: boolean
  cookies: boolean
  supabaseStorage: boolean
  errors: string[]
}