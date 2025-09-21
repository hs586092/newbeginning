'use client'

import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export class RealtimeConnectionManager {
  private channels = new Map<string, RealtimeChannel>()
  private isAuthenticated = false
  private retryCount = 0
  private maxRetries = 3

  constructor() {
    this.initializeAuthListener()
  }

  private initializeAuthListener() {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      const wasAuthenticated = this.isAuthenticated
      this.isAuthenticated = !!session

      if (event === 'SIGNED_IN' && !wasAuthenticated) {
        console.log('User signed in, enabling realtime subscriptions')
        this.retryCount = 0
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, cleaning up realtime subscriptions')
        this.cleanup()
      }
    })
  }

  async createChannel(channelName: string): Promise<RealtimeChannel | null> {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.warn(`Cannot create channel ${channelName}: User not authenticated`)
        return null
      }

      // Remove existing channel with same name
      if (this.channels.has(channelName)) {
        await this.removeChannel(channelName)
      }

      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: session.user.id
          }
        }
      })

      this.channels.set(channelName, channel)
      console.log(`Created realtime channel: ${channelName}`)
      return channel

    } catch (error) {
      console.error(`Failed to create channel ${channelName}:`, error)

      // Retry logic
      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        console.log(`Retrying channel creation (${this.retryCount}/${this.maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount))
        return this.createChannel(channelName)
      }

      return null
    }
  }

  async removeChannel(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName)
    if (channel) {
      try {
        await supabase.removeChannel(channel)
        this.channels.delete(channelName)
        console.log(`Removed realtime channel: ${channelName}`)
      } catch (error) {
        console.error(`Failed to remove channel ${channelName}:`, error)
      }
    }
  }

  async cleanup(): Promise<void> {
    console.log('Cleaning up all realtime channels')
    const promises = Array.from(this.channels.keys()).map(channelName =>
      this.removeChannel(channelName)
    )
    await Promise.all(promises)
    this.channels.clear()
  }

  getChannelStatus(channelName: string): string {
    const channel = this.channels.get(channelName)
    return channel?.state || 'not_created'
  }

  isChannelActive(channelName: string): boolean {
    const channel = this.channels.get(channelName)
    return channel?.state === 'joined'
  }

  async waitForConnection(channelName: string, timeoutMs: number = 5000): Promise<boolean> {
    const channel = this.channels.get(channelName)
    if (!channel) return false

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), timeoutMs)

      const unsubscribe = channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout)
          unsubscribe()
          resolve(true)
        } else if (status === 'CLOSED' || status === 'TIMED_OUT') {
          clearTimeout(timeout)
          unsubscribe()
          resolve(false)
        }
      })
    })
  }
}

// Global instance
export const realtimeManager = new RealtimeConnectionManager()