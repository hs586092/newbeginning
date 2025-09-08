'use client'

/**
 * Authentication State Machine Types
 * Implements State Pattern for robust auth state management
 * Prevents race conditions and dual loading states
 */

// Core State Machine States
export enum AuthMachineState {
  INITIALIZING = 'INITIALIZING',
  AUTHENTICATING = 'AUTHENTICATING', 
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  SIGNING_OUT = 'SIGNING_OUT',
  OAUTH_CALLBACK = 'OAUTH_CALLBACK',
  ERROR = 'ERROR'
}

// State Machine Events
export enum AuthMachineEvent {
  INITIALIZE = 'INITIALIZE',
  SIGN_IN_START = 'SIGN_IN_START',
  SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS',
  SIGN_IN_ERROR = 'SIGN_IN_ERROR',
  SIGN_OUT_START = 'SIGN_OUT_START',
  SIGN_OUT_SUCCESS = 'SIGN_OUT_SUCCESS',
  SIGN_OUT_ERROR = 'SIGN_OUT_ERROR',
  OAUTH_CALLBACK_DETECTED = 'OAUTH_CALLBACK_DETECTED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  ERROR_RECOVERY = 'ERROR_RECOVERY',
  RESET = 'RESET'
}

// State Machine Context
export interface AuthMachineContext {
  user: any | null
  profile: any | null
  session: any | null
  error: string | null
  provider: 'google' | 'kakao' | 'email' | null
  oauthRetryCount: number
  lastError: string | null
}

// State Machine Configuration
export interface AuthStateTransition {
  from: AuthMachineState
  event: AuthMachineEvent
  to: AuthMachineState
  condition?: (context: AuthMachineContext) => boolean
  action?: (context: AuthMachineContext) => Partial<AuthMachineContext>
}

// Loading State Determination
export interface LoadingStateConfig {
  showSpinner: boolean
  message: string
  subMessage?: string
  canCancel: boolean
}

// State Machine Actions
export interface AuthMachineActions {
  onStateChange: (state: AuthMachineState, context: AuthMachineContext) => void
  onError: (error: string, context: AuthMachineContext) => void
  onUserChange: (user: any | null, context: AuthMachineContext) => void
}