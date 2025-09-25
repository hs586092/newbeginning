/**
 * Real-time hooks for React components
 * Provides easy-to-use hooks for real-time data subscriptions
 */

import { useEffect, useCallback, useRef } from 'react'
import {
  realtimeService,
  RealtimeSubscription,
  PostUpdate,
  MessageUpdate,
  NotificationUpdate
} from '@/lib/services/realtime-service'
import { useAuth } from '@/contexts/auth-context'

/**
 * Hook for real-time post updates
 */
export function useRealtimePosts(
  onPostUpdate?: (update: PostUpdate) => void,
  enabled: boolean = true
) {
  const subscriptionRef = useRef<RealtimeSubscription | null>(null)

  const handleUpdate = useCallback((update: PostUpdate) => {
    console.log('🔄 Post update received:', update)
    onPostUpdate?.(update)
  }, [onPostUpdate])

  const handleError = useCallback((error: Error) => {
    console.error('🚨 Real-time post error:', error)
  }, [])

  useEffect(() => {
    if (!enabled || !onPostUpdate) return

    // Subscribe to post updates
    subscriptionRef.current = realtimeService.subscribeToPostUpdates(
      handleUpdate,
      handleError
    )

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cleanup()
        subscriptionRef.current = null
      }
    }
  }, [enabled, handleUpdate, handleError, onPostUpdate])

  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.cleanup()
      subscriptionRef.current = null
    }
  }, [])

  return { cleanup }
}

/**
 * Hook for real-time message updates
 */
export function useRealtimeMessages(
  onMessageUpdate?: (update: MessageUpdate) => void,
  enabled: boolean = true
) {
  const { user } = useAuth()
  const subscriptionRef = useRef<RealtimeSubscription | null>(null)

  const handleUpdate = useCallback((update: MessageUpdate) => {
    console.log('🔄 Message update received:', update)
    onMessageUpdate?.(update)
  }, [onMessageUpdate])

  const handleError = useCallback((error: Error) => {
    console.error('🚨 Real-time message error:', error)
  }, [])

  useEffect(() => {
    if (!enabled || !user?.id || !onMessageUpdate) return

    // Subscribe to message updates
    subscriptionRef.current = realtimeService.subscribeToMessageUpdates(
      user.id,
      handleUpdate,
      handleError
    )

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cleanup()
        subscriptionRef.current = null
      }
    }
  }, [enabled, user?.id, handleUpdate, handleError, onMessageUpdate])

  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.cleanup()
      subscriptionRef.current = null
    }
  }, [])

  return { cleanup }
}

/**
 * Hook for real-time notification updates
 */
export function useRealtimeNotifications(
  onNotificationUpdate?: (update: NotificationUpdate) => void,
  enabled: boolean = true
) {
  const { user } = useAuth()
  const subscriptionRef = useRef<RealtimeSubscription | null>(null)

  const handleUpdate = useCallback((update: NotificationUpdate) => {
    console.log('🔄 Notification update received:', update)
    onNotificationUpdate?.(update)
  }, [onNotificationUpdate])

  const handleError = useCallback((error: Error) => {
    console.error('🚨 Real-time notification error:', error)
  }, [])

  useEffect(() => {
    if (!enabled || !user?.id || !onNotificationUpdate) return

    // Subscribe to notification updates
    subscriptionRef.current = realtimeService.subscribeToNotificationUpdates(
      user.id,
      handleUpdate,
      handleError
    )

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cleanup()
        subscriptionRef.current = null
      }
    }
  }, [enabled, user?.id, handleUpdate, handleError, onNotificationUpdate])

  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.cleanup()
      subscriptionRef.current = null
    }
  }, [])

  return { cleanup }
}

/**
 * Hook for real-time activity updates
 */
export function useRealtimeActivity(
  onActivityUpdate?: (update: any) => void,
  enabled: boolean = true
) {
  const { user } = useAuth()
  const subscriptionRef = useRef<RealtimeSubscription | null>(null)

  const handleUpdate = useCallback((update: any) => {
    console.log('🔄 Activity update received:', update)
    onActivityUpdate?.(update)
  }, [onActivityUpdate])

  const handleError = useCallback((error: Error) => {
    console.error('🚨 Real-time activity error:', error)
  }, [])

  useEffect(() => {
    if (!enabled || !user?.id || !onActivityUpdate) return

    // Subscribe to activity updates
    subscriptionRef.current = realtimeService.subscribeToActivityUpdates(
      user.id,
      handleUpdate,
      handleError
    )

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.cleanup()
        subscriptionRef.current = null
      }
    }
  }, [enabled, user?.id, handleUpdate, handleError, onActivityUpdate])

  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.cleanup()
      subscriptionRef.current = null
    }
  }, [])

  return { cleanup }
}

/**
 * Combined hook for all real-time subscriptions
 */
export function useRealtimeSubscriptions({
  onPostUpdate,
  onMessageUpdate,
  onNotificationUpdate,
  onActivityUpdate,
  enabled = true
}: {
  onPostUpdate?: (update: PostUpdate) => void
  onMessageUpdate?: (update: MessageUpdate) => void
  onNotificationUpdate?: (update: NotificationUpdate) => void
  onActivityUpdate?: (update: any) => void
  enabled?: boolean
}) {
  const posts = useRealtimePosts(onPostUpdate, enabled)
  const messages = useRealtimeMessages(onMessageUpdate, enabled)
  const notifications = useRealtimeNotifications(onNotificationUpdate, enabled)
  const activity = useRealtimeActivity(onActivityUpdate, enabled)

  const cleanupAll = useCallback(() => {
    posts.cleanup()
    messages.cleanup()
    notifications.cleanup()
    activity.cleanup()
  }, [posts, messages, notifications, activity])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAll()
    }
  }, [cleanupAll])

  return {
    cleanup: cleanupAll,
    status: {
      posts: !!posts,
      messages: !!messages,
      notifications: !!notifications,
      activity: !!activity
    }
  }
}