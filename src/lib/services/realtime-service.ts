/**
 * Realtime Service Layer
 * Handles real-time subscriptions for posts, messages, and notifications
 */

import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE'

export interface RealtimeSubscription {
  id: string
  channel: RealtimeChannel
  cleanup: () => void
}

export interface PostUpdate {
  eventType: RealtimeEventType
  post: any
  timestamp: string
}

export interface MessageUpdate {
  eventType: RealtimeEventType
  message: any
  timestamp: string
}

export interface NotificationUpdate {
  eventType: RealtimeEventType
  notification: any
  timestamp: string
}

class RealtimeService {
  private supabase: SupabaseClient
  private subscriptions: Map<string, RealtimeSubscription> = new Map()

  constructor() {
    this.supabase = createClient()
  }

  /**
   * Subscribe to real-time post updates
   */
  subscribeToPostUpdates(
    onUpdate: (update: PostUpdate) => void,
    onError?: (error: Error) => void
  ): RealtimeSubscription {
    const subscriptionId = `posts_${Date.now()}`

    const channel = this.supabase
      .channel(`posts-${subscriptionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('📡 Real-time post update:', payload)

          try {
            const update: PostUpdate = {
              eventType: payload.eventType as RealtimeEventType,
              post: payload.new || payload.old,
              timestamp: new Date().toISOString()
            }

            onUpdate(update)
          } catch (error) {
            console.error('🚨 Error processing post update:', error)
            onError?.(error instanceof Error ? error : new Error('Unknown error'))
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to post updates')
        } else if (status === 'CLOSED') {
          console.log('🔌 Post subscription closed')
        } else if (err) {
          console.error('🚨 Post subscription error:', err)
          onError?.(new Error(err.message || 'Subscription error'))
        }
      })

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      cleanup: () => {
        console.log('🧹 Cleaning up post subscription:', subscriptionId)
        this.supabase.removeChannel(channel)
        this.subscriptions.delete(subscriptionId)
      }
    }

    this.subscriptions.set(subscriptionId, subscription)
    return subscription
  }

  /**
   * Subscribe to real-time message updates
   */
  subscribeToMessageUpdates(
    userId: string,
    onUpdate: (update: MessageUpdate) => void,
    onError?: (error: Error) => void
  ): RealtimeSubscription {
    const subscriptionId = `messages_${userId}_${Date.now()}`

    const channel = this.supabase
      .channel(`messages-${subscriptionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId},receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('📡 Real-time message update:', payload)

          try {
            const update: MessageUpdate = {
              eventType: payload.eventType as RealtimeEventType,
              message: payload.new || payload.old,
              timestamp: new Date().toISOString()
            }

            onUpdate(update)
          } catch (error) {
            console.error('🚨 Error processing message update:', error)
            onError?.(error instanceof Error ? error : new Error('Unknown error'))
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to message updates for user:', userId)
        } else if (status === 'CLOSED') {
          console.log('🔌 Message subscription closed for user:', userId)
        } else if (err) {
          console.error('🚨 Message subscription error:', err)
          onError?.(new Error(err.message || 'Subscription error'))
        }
      })

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      cleanup: () => {
        console.log('🧹 Cleaning up message subscription:', subscriptionId)
        this.supabase.removeChannel(channel)
        this.subscriptions.delete(subscriptionId)
      }
    }

    this.subscriptions.set(subscriptionId, subscription)
    return subscription
  }

  /**
   * Subscribe to real-time notification updates
   */
  subscribeToNotificationUpdates(
    userId: string,
    onUpdate: (update: NotificationUpdate) => void,
    onError?: (error: Error) => void
  ): RealtimeSubscription {
    const subscriptionId = `notifications_${userId}_${Date.now()}`

    const channel = this.supabase
      .channel(`notifications-${subscriptionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('📡 Real-time notification update:', payload)

          try {
            const update: NotificationUpdate = {
              eventType: payload.eventType as RealtimeEventType,
              notification: payload.new || payload.old,
              timestamp: new Date().toISOString()
            }

            onUpdate(update)
          } catch (error) {
            console.error('🚨 Error processing notification update:', error)
            onError?.(error instanceof Error ? error : new Error('Unknown error'))
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to notification updates for user:', userId)
        } else if (status === 'CLOSED') {
          console.log('🔌 Notification subscription closed for user:', userId)
        } else if (err) {
          console.error('🚨 Notification subscription error:', err)
          onError?.(new Error(err.message || 'Subscription error'))
        }
      })

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      cleanup: () => {
        console.log('🧹 Cleaning up notification subscription:', subscriptionId)
        this.supabase.removeChannel(channel)
        this.subscriptions.delete(subscriptionId)
      }
    }

    this.subscriptions.set(subscriptionId, subscription)
    return subscription
  }

  /**
   * Subscribe to activity feed updates
   */
  subscribeToActivityUpdates(
    userId: string,
    onUpdate: (update: any) => void,
    onError?: (error: Error) => void
  ): RealtimeSubscription {
    const subscriptionId = `activity_${userId}_${Date.now()}`

    const channel = this.supabase
      .channel(`activity-${subscriptionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_activities',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('📡 Real-time activity update:', payload)
          onUpdate(payload)
        }
      )
      .subscribe()

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      cleanup: () => {
        console.log('🧹 Cleaning up activity subscription:', subscriptionId)
        this.supabase.removeChannel(channel)
        this.subscriptions.delete(subscriptionId)
      }
    }

    this.subscriptions.set(subscriptionId, subscription)
    return subscription
  }

  /**
   * Cleanup specific subscription
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription) {
      subscription.cleanup()
      return true
    }
    return false
  }

  /**
   * Cleanup all subscriptions
   */
  unsubscribeAll(): void {
    console.log('🧹 Cleaning up all realtime subscriptions')

    for (const subscription of this.subscriptions.values()) {
      subscription.cleanup()
    }

    this.subscriptions.clear()
  }

  /**
   * Get active subscription count
   */
  getActiveSubscriptionCount(): number {
    return this.subscriptions.size
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus(): { [key: string]: string } {
    const status: { [key: string]: string } = {}

    for (const [id, subscription] of this.subscriptions) {
      status[id] = subscription.channel.state
    }

    return status
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService()

// Cleanup subscriptions on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realtimeService.unsubscribeAll()
  })
}