/**
 * Realtime Service Layer - Best Practice Implementation
 * Handles real-time subscriptions with proper async patterns
 */

import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE'

export interface RealtimeSubscription {
  id: string
  channel: RealtimeChannel
  cleanup: () => Promise<void>
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
  private supabasePromise: Promise<SupabaseClient> | null = null
  private subscriptions: Map<string, RealtimeSubscription> = new Map()

  constructor() {
    // Clean initialization - no async calls in constructor
  }

  private async getSupabaseClient(): Promise<SupabaseClient> {
    if (!this.supabasePromise) {
      this.supabasePromise = createClient()
    }
    return this.supabasePromise
  }

  /**
   * Subscribe to real-time post updates
   */
  async subscribeToPostUpdates(
    onUpdate: (update: PostUpdate) => void,
    onError?: (error: Error) => void
  ): Promise<RealtimeSubscription | null> {
    const subscriptionId = `posts_${Date.now()}`

    try {
      const supabase = await this.getSupabaseClient()

      const channel = supabase
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
            } catch (err) {
              const error = err instanceof Error ? err : new Error('Update processing error')
              console.error('Post update processing error:', error)
              onError?.(error)
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
        cleanup: async () => {
          console.log('🧹 Cleaning up post subscription:', subscriptionId)
          try {
            const client = await this.getSupabaseClient()
            await client.removeChannel(channel)
            this.subscriptions.delete(subscriptionId)
          } catch (error) {
            console.error('Cleanup error:', error)
          }
        }
      }

      this.subscriptions.set(subscriptionId, subscription)
      return subscription
    } catch (error) {
      console.error('Failed to subscribe to post updates:', error)
      onError?.(error instanceof Error ? error : new Error('Subscription failed'))
      return null
    }
  }

  /**
   * Subscribe to real-time message updates
   */
  async subscribeToMessageUpdates(
    userId: string,
    onUpdate: (update: MessageUpdate) => void,
    onError?: (error: Error) => void
  ): Promise<RealtimeSubscription | null> {
    const subscriptionId = `messages_${userId}_${Date.now()}`

    try {
      const supabase = await this.getSupabaseClient()

      const channel = supabase
        .channel(`messages-${subscriptionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_messages',
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
            } catch (err) {
              const error = err instanceof Error ? err : new Error('Update processing error')
              console.error('Message update processing error:', error)
              onError?.(error)
            }
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscribed to message updates')
          } else if (status === 'CLOSED') {
            console.log('🔌 Message subscription closed')
          } else if (err) {
            console.error('🚨 Message subscription error:', err)
            onError?.(new Error(err.message || 'Subscription error'))
          }
        })

      const subscription: RealtimeSubscription = {
        id: subscriptionId,
        channel,
        cleanup: async () => {
          console.log('🧹 Cleaning up message subscription:', subscriptionId)
          try {
            const client = await this.getSupabaseClient()
            await client.removeChannel(channel)
            this.subscriptions.delete(subscriptionId)
          } catch (error) {
            console.error('Cleanup error:', error)
          }
        }
      }

      this.subscriptions.set(subscriptionId, subscription)
      return subscription
    } catch (error) {
      console.error('Failed to subscribe to message updates:', error)
      onError?.(error instanceof Error ? error : new Error('Subscription failed'))
      return null
    }
  }

  /**
   * Subscribe to real-time notification updates
   */
  async subscribeToNotificationUpdates(
    userId: string,
    onUpdate: (update: NotificationUpdate) => void,
    onError?: (error: Error) => void
  ): Promise<RealtimeSubscription | null> {
    const subscriptionId = `notifications_${userId}_${Date.now()}`

    try {
      const supabase = await this.getSupabaseClient()

      const channel = supabase
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
            } catch (err) {
              const error = err instanceof Error ? err : new Error('Update processing error')
              console.error('Notification update processing error:', error)
              onError?.(error)
            }
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscribed to notification updates')
          } else if (status === 'CLOSED') {
            console.log('🔌 Notification subscription closed')
          } else if (err) {
            console.error('🚨 Notification subscription error:', err)
            onError?.(new Error(err.message || 'Subscription error'))
          }
        })

      const subscription: RealtimeSubscription = {
        id: subscriptionId,
        channel,
        cleanup: async () => {
          console.log('🧹 Cleaning up notification subscription:', subscriptionId)
          try {
            const client = await this.getSupabaseClient()
            await client.removeChannel(channel)
            this.subscriptions.delete(subscriptionId)
          } catch (error) {
            console.error('Cleanup error:', error)
          }
        }
      }

      this.subscriptions.set(subscriptionId, subscription)
      return subscription
    } catch (error) {
      console.error('Failed to subscribe to notification updates:', error)
      onError?.(error instanceof Error ? error : new Error('Subscription failed'))
      return null
    }
  }

  /**
   * Unsubscribe from a specific subscription
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription) {
      await subscription.cleanup()
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  async unsubscribeAll(): Promise<void> {
    const promises = Array.from(this.subscriptions.values()).map(sub => sub.cleanup())
    await Promise.all(promises)
    this.subscriptions.clear()
  }

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptionsCount(): number {
    return this.subscriptions.size
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): RealtimeSubscription | undefined {
    return this.subscriptions.get(subscriptionId)
  }
}

// Singleton instance
const realtimeService = new RealtimeService()
export default realtimeService