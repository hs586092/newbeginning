/**
 * Native DOM Events 템플릿
 * 댓글 시스템의 성공 패턴을 기반으로 한 React 이벤트 핸들러 문제 해결 템플릿
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

// 1. Native DOM Event Handler 타입 정의
interface NativeDOMEventConfig<T> {
  elementRef: React.RefObject<HTMLElement>
  eventHandlers: {
    onClick?: (event: Event, data: T) => Promise<void> | void
    onKeyDown?: (event: KeyboardEvent, data: T) => Promise<void> | void
    onTouchStart?: (event: TouchEvent, data: T) => Promise<void> | void
    onMouseDown?: (event: MouseEvent, data: T) => Promise<void> | void
  }
  data: T
  isDisabled?: boolean
  requiresAuth?: boolean
  isLoggedIn?: boolean
  debugName?: string
}

// 2. Native DOM Event Hook
export function useNativeDOMEvents<T>({
  elementRef,
  eventHandlers,
  data,
  isDisabled = false,
  requiresAuth = false,
  isLoggedIn = false,
  debugName = 'Element'
}: NativeDOMEventConfig<T>) {
  
  const handleEvent = useCallback(async (
    event: Event,
    handler?: (event: any, data: T) => Promise<void> | void
  ) => {
    if (isDisabled) return
    
    event.preventDefault()
    event.stopPropagation()
    
    console.log(`🔥 ${debugName}: 네이티브 DOM 이벤트 발생!`, event.type)
    
    if (requiresAuth && !isLoggedIn) {
      toast.error('로그인이 필요합니다.')
      return
    }
    
    if (handler) {
      try {
        await handler(event, data)
        console.log(`✅ ${debugName}: 이벤트 처리 완료`)
      } catch (error) {
        console.error(`❌ ${debugName}: 이벤트 처리 오류`, error)
        toast.error('오류가 발생했습니다.')
      }
    }
  }, [data, isDisabled, requiresAuth, isLoggedIn, debugName])
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    console.log(`🔧 ${debugName}: 네이티브 DOM 이벤트 리스너 등록`)
    
    // Click 이벤트
    const handleClick = (event: Event) => {
      handleEvent(event, eventHandlers.onClick)
    }
    
    // KeyDown 이벤트 (Enter, Space)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        console.log(`🔥 ${debugName}: 네이티브 키보드 이벤트!`)
        handleEvent(event, eventHandlers.onKeyDown || eventHandlers.onClick)
      }
    }
    
    // Touch 이벤트
    const handleTouchStart = (event: TouchEvent) => {
      handleEvent(event, eventHandlers.onTouchStart || eventHandlers.onClick)
    }
    
    // Mouse Down 이벤트
    const handleMouseDown = (event: MouseEvent) => {
      handleEvent(event, eventHandlers.onMouseDown || eventHandlers.onClick)
    }
    
    // 다중 이벤트 등록으로 확실하게 캐치
    element.addEventListener('click', handleClick, { passive: false })
    element.addEventListener('mousedown', handleMouseDown, { passive: false })
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('keydown', handleKeyDown)
    
    return () => {
      console.log(`🧹 ${debugName}: 네이티브 DOM 이벤트 리스너 제거`)
      element.removeEventListener('click', handleClick)
      element.removeEventListener('mousedown', handleMouseDown)
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('keydown', handleKeyDown)
    }
  }, [elementRef, eventHandlers, handleEvent, debugName])
}

// 3. Interactive Element 컴포넌트 템플릿
interface InteractiveElementProps<T> {
  data: T
  children: React.ReactNode
  className?: string
  onClick?: (event: Event, data: T) => Promise<void> | void
  requiresAuth?: boolean
  isLoggedIn?: boolean
  isDisabled?: boolean
  debugName?: string
  role?: string
  tabIndex?: number
  'aria-label'?: string
  title?: string
}

export function createInteractiveElement<T>() {
  return function InteractiveElement({
    data,
    children,
    className = '',
    onClick,
    requiresAuth = false,
    isLoggedIn = false,
    isDisabled = false,
    debugName = 'InteractiveElement',
    role = 'button',
    tabIndex = 0,
    'aria-label': ariaLabel,
    title,
    ...props
  }: InteractiveElementProps<T>) {
    const elementRef = useRef<HTMLDivElement>(null)
    
    useNativeDOMEvents({
      elementRef,
      eventHandlers: { onClick },
      data,
      isDisabled,
      requiresAuth,
      isLoggedIn,
      debugName
    })
    
    return (
      <div
        ref={elementRef}
        className={`cursor-pointer select-none touch-manipulation ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        role={role}
        tabIndex={isDisabled ? -1 : tabIndex}
        aria-label={ariaLabel}
        title={title}
        data-debug-name={debugName}
        {...props}
      >
        {children}
      </div>
    )
  }
}

// 4. Button 컴포넌트 템플릿 (기존 React onClick 유지 + Native DOM 보강)
interface InteractiveButtonProps<T> {
  data: T
  onClick?: (event: Event, data: T) => Promise<void> | void
  onNativeClick?: (event: Event, data: T) => Promise<void> | void  // Native DOM 전용
  children: React.ReactNode
  className?: string
  disabled?: boolean
  requiresAuth?: boolean
  isLoggedIn?: boolean
  debugName?: string
  type?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
  title?: string
}

export function createInteractiveButton<T>() {
  return function InteractiveButton({
    data,
    onClick,
    onNativeClick,
    children,
    className = '',
    disabled = false,
    requiresAuth = false,
    isLoggedIn = false,
    debugName = 'InteractiveButton',
    type = 'button',
    'aria-label': ariaLabel,
    title,
    ...props
  }: InteractiveButtonProps<T>) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    
    // Native DOM Events 추가 (필요시)
    useNativeDOMEvents({
      elementRef: buttonRef,
      eventHandlers: { onClick: onNativeClick },
      data,
      isDisabled: disabled,
      requiresAuth,
      isLoggedIn,
      debugName: `${debugName}-Native`
    })
    
    const handleReactClick = useCallback(async (event: React.MouseEvent) => {
      if (disabled) return
      
      if (requiresAuth && !isLoggedIn) {
        toast.error('로그인이 필요합니다.')
        return
      }
      
      if (onClick) {
        try {
          await onClick(event.nativeEvent, data)
        } catch (error) {
          console.error(`❌ ${debugName}: React 클릭 오류`, error)
          toast.error('오류가 발생했습니다.')
        }
      }
    }, [onClick, data, disabled, requiresAuth, isLoggedIn, debugName])
    
    return (
      <button
        ref={buttonRef}
        type={type}
        onClick={handleReactClick}
        disabled={disabled}
        className={`touch-manipulation ${disabled ? 'opacity-50' : ''} ${className}`}
        aria-label={ariaLabel}
        title={title}
        data-debug-name={debugName}
        {...props}
      >
        {children}
      </button>
    )
  }
}

// 5. 사용 예시 (댓글 버튼 재구현)
/*
const CommentButton = createInteractiveElement<{ postId: string }>()

function CommentInteraction({ postId, commentsCount, isLoggedIn, onToggle }) {
  return (
    <CommentButton
      data={{ postId }}
      onClick={async (event, { postId }) => {
        await onToggle(postId)
      }}
      requiresAuth={true}
      isLoggedIn={isLoggedIn}
      className="flex items-center space-x-2 px-3 py-2 rounded-full transition-colors"
      debugName="CommentButton"
      aria-label={`댓글 열기 - 댓글 ${commentsCount}개`}
      title="댓글 열기"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-medium">{commentsCount}</span>
    </CommentButton>
  )
}

// 또는 기존 버튼 방식 유지
const LikeButton = createInteractiveButton<{ postId: string, isLiked: boolean }>()

function LikeInteraction({ postId, isLiked, likesCount, onToggle }) {
  return (
    <LikeButton
      data={{ postId, isLiked }}
      onClick={async (event, { postId }) => {
        await onToggle(postId)
      }}
      className="flex items-center space-x-2 px-3 py-2 rounded-full"
      debugName="LikeButton"
    >
      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likesCount}</span>
    </LikeButton>
  )
}
*/