'use client'

import { 
  AuthMachineState, 
  AuthMachineEvent, 
  AuthMachineContext,
  AuthStateTransition,
  LoadingStateConfig,
  AuthMachineActions
} from '@/types/auth-state-machine.types'

/**
 * Authentication State Machine Implementation
 * Single Source of Truth for all auth-related states
 * Prevents race conditions and ensures predictable state transitions
 */
export class AuthStateMachine {
  private currentState: AuthMachineState = AuthMachineState.INITIALIZING
  private context: AuthMachineContext
  private actions: AuthMachineActions
  private debugMode: boolean

  // State transition table - defines all valid transitions
  private transitions: AuthStateTransition[] = [
    // Initialization
    { from: AuthMachineState.INITIALIZING, event: AuthMachineEvent.SIGN_IN_SUCCESS, to: AuthMachineState.AUTHENTICATED },
    { from: AuthMachineState.INITIALIZING, event: AuthMachineEvent.SIGN_IN_ERROR, to: AuthMachineState.UNAUTHENTICATED },
    { from: AuthMachineState.INITIALIZING, event: AuthMachineEvent.OAUTH_CALLBACK_DETECTED, to: AuthMachineState.OAUTH_CALLBACK },
    
    // Authentication flows
    { from: AuthMachineState.UNAUTHENTICATED, event: AuthMachineEvent.SIGN_IN_START, to: AuthMachineState.AUTHENTICATING },
    { from: AuthMachineState.AUTHENTICATING, event: AuthMachineEvent.SIGN_IN_SUCCESS, to: AuthMachineState.AUTHENTICATED },
    { from: AuthMachineState.AUTHENTICATING, event: AuthMachineEvent.SIGN_IN_ERROR, to: AuthMachineState.UNAUTHENTICATED },
    
    // OAuth callback handling
    { from: AuthMachineState.OAUTH_CALLBACK, event: AuthMachineEvent.SIGN_IN_SUCCESS, to: AuthMachineState.AUTHENTICATED },
    { from: AuthMachineState.OAUTH_CALLBACK, event: AuthMachineEvent.SIGN_IN_ERROR, to: AuthMachineState.UNAUTHENTICATED },
    
    // Sign out flows
    { from: AuthMachineState.AUTHENTICATED, event: AuthMachineEvent.SIGN_OUT_START, to: AuthMachineState.SIGNING_OUT },
    { from: AuthMachineState.SIGNING_OUT, event: AuthMachineEvent.SIGN_OUT_SUCCESS, to: AuthMachineState.UNAUTHENTICATED },
    { from: AuthMachineState.SIGNING_OUT, event: AuthMachineEvent.SIGN_OUT_ERROR, to: AuthMachineState.ERROR },
    
    // Session management
    { from: AuthMachineState.AUTHENTICATED, event: AuthMachineEvent.SESSION_EXPIRED, to: AuthMachineState.UNAUTHENTICATED },
    
    // Error handling
    { from: AuthMachineState.ERROR, event: AuthMachineEvent.ERROR_RECOVERY, to: AuthMachineState.UNAUTHENTICATED },
    { from: AuthMachineState.ERROR, event: AuthMachineEvent.RESET, to: AuthMachineState.INITIALIZING },
    
    // Reset capability from any state
    { from: AuthMachineState.INITIALIZING, event: AuthMachineEvent.RESET, to: AuthMachineState.INITIALIZING },
    { from: AuthMachineState.AUTHENTICATING, event: AuthMachineEvent.RESET, to: AuthMachineState.INITIALIZING },
    { from: AuthMachineState.AUTHENTICATED, event: AuthMachineEvent.RESET, to: AuthMachineState.INITIALIZING },
    { from: AuthMachineState.UNAUTHENTICATED, event: AuthMachineEvent.RESET, to: AuthMachineState.INITIALIZING },
    { from: AuthMachineState.SIGNING_OUT, event: AuthMachineEvent.RESET, to: AuthMachineState.INITIALIZING },
    { from: AuthMachineState.OAUTH_CALLBACK, event: AuthMachineEvent.RESET, to: AuthMachineState.INITIALIZING }
  ]

  constructor(actions: AuthMachineActions, debugMode = false) {
    this.actions = actions
    this.debugMode = debugMode
    this.context = {
      user: null,
      profile: null,
      session: null,
      error: null,
      provider: null,
      oauthRetryCount: 0,
      lastError: null
    }
  }

  private log(message: string, data?: any) {
    if (this.debugMode) {
      console.log(`[AuthStateMachine] ${message}`, data || '')
    }
  }

  private logError(message: string, error: any) {
    console.error(`[AuthStateMachine] ${message}`, error)
  }

  /**
   * Get current state
   */
  public getCurrentState(): AuthMachineState {
    return this.currentState
  }

  /**
   * Get current context
   */
  public getContext(): AuthMachineContext {
    return { ...this.context }
  }

  /**
   * Check if transition is valid
   */
  private canTransition(event: AuthMachineEvent): boolean {
    const validTransition = this.transitions.find(
      t => t.from === this.currentState && t.event === event
    )
    
    if (!validTransition) {
      this.logError(`Invalid transition: ${this.currentState} + ${event}`, {
        currentState: this.currentState,
        event,
        validTransitions: this.transitions.filter(t => t.from === this.currentState)
      })
      return false
    }

    // Check condition if present
    if (validTransition.condition && !validTransition.condition(this.context)) {
      this.log(`Transition condition not met: ${this.currentState} + ${event}`)
      return false
    }

    return true
  }

  /**
   * Send event to state machine
   */
  public send(event: AuthMachineEvent, payload?: Partial<AuthMachineContext>): void {
    this.log(`Sending event: ${event} from state: ${this.currentState}`, payload)

    if (!this.canTransition(event)) {
      return
    }

    const transition = this.transitions.find(
      t => t.from === this.currentState && t.event === event
    )!

    const previousState = this.currentState
    const previousContext = { ...this.context }

    // Update context with payload if provided
    if (payload) {
      this.context = { ...this.context, ...payload }
    }

    // Execute transition action if present
    if (transition.action) {
      const contextUpdate = transition.action(this.context)
      this.context = { ...this.context, ...contextUpdate }
    }

    // Transition to new state
    this.currentState = transition.to
    
    this.log(`State transition: ${previousState} → ${this.currentState}`, {
      event,
      previousContext,
      newContext: this.context
    })

    // Notify actions
    this.actions.onStateChange(this.currentState, this.context)
    
    if (this.context.user !== previousContext.user) {
      this.actions.onUserChange(this.context.user, this.context)
    }

    if (this.context.error && this.context.error !== previousContext.error) {
      this.actions.onError(this.context.error, this.context)
    }
  }

  /**
   * Get loading configuration for current state
   */
  public getLoadingConfig(): LoadingStateConfig {
    switch (this.currentState) {
      case AuthMachineState.INITIALIZING:
        return {
          showSpinner: true,
          message: '인증 상태 확인 중...',
          subMessage: '잠시만 기다려 주세요',
          canCancel: false
        }

      case AuthMachineState.AUTHENTICATING:
        return {
          showSpinner: true,
          message: '로그인 중...',
          subMessage: this.context.provider === 'kakao' ? '카카오 로그인 처리 중...' : '로그인을 처리하는 중입니다...',
          canCancel: true
        }

      case AuthMachineState.OAUTH_CALLBACK:
        const isKakao = this.context.provider === 'kakao'
        return {
          showSpinner: true,
          message: '로그인 처리 중...',
          subMessage: isKakao ? '카카오 로그인을 완료하는 중입니다...' : '구글 로그인을 완료하는 중입니다...',
          canCancel: false
        }

      case AuthMachineState.SIGNING_OUT:
        return {
          showSpinner: true,
          message: '로그아웃 중...',
          subMessage: '잠시만 기다려 주세요',
          canCancel: false
        }

      default:
        return {
          showSpinner: false,
          message: '',
          canCancel: false
        }
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentState === AuthMachineState.AUTHENTICATED && !!this.context.user
  }

  /**
   * Check if machine is in loading state
   */
  public isLoading(): boolean {
    return [
      AuthMachineState.INITIALIZING,
      AuthMachineState.AUTHENTICATING,
      AuthMachineState.OAUTH_CALLBACK,
      AuthMachineState.SIGNING_OUT
    ].includes(this.currentState)
  }

  /**
   * Check if machine is in error state
   */
  public isError(): boolean {
    return this.currentState === AuthMachineState.ERROR
  }

  /**
   * Reset state machine to initial state
   */
  public reset(): void {
    this.send(AuthMachineEvent.RESET)
  }

  /**
   * Get state machine status for debugging
   */
  public getStatus() {
    return {
      currentState: this.currentState,
      context: this.context,
      isAuthenticated: this.isAuthenticated(),
      isLoading: this.isLoading(),
      isError: this.isError(),
      loadingConfig: this.getLoadingConfig()
    }
  }
}