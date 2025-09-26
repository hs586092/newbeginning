'use client'

import { getRealtimeClient } from '@/lib/supabase/client'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

export class RealtimeConnectionManager {
  private channels = new Map<string, RealtimeChannel>()
  private isAuthenticated = false
  private retryCount = 0
  private maxRetries = 3
  private supabasePromise: Promise<SupabaseClient> | null = null

  constructor() {
    // Don't call async methods in constructor
  }

  private getSupabaseClient(): Promise<SupabaseClient> {
    if (!this.supabasePromise) {
      this.supabasePromise = getRealtimeClient()
    }
    return this.supabasePromise
  }

  async createChannel(channelName: string): Promise<RealtimeChannel | null> {
    // 🔄 Following CLAUDE.md principle: Graceful Degradation
    console.log(`🔄 [RealtimeConnectionManager] Creating channel: ${channelName}`)

    try {
      // Get supabase client
      const supabase = await this.getSupabaseClient()

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.log(`User not authenticated, skipping realtime subscriptions`)
        return null
      }

      // Remove existing channel with same name
      if (this.channels.has(channelName)) {
        await this.removeChannel(channelName)
      }

      // 🛡️ Evidence-based approach: Try WebSocket with timeout
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.log(`⚠️ WebSocket timeout for channel ${channelName}, gracefully degrading`)
          resolve(null) // Graceful degradation - return null instead of throwing
        }, 5000)

        const channel = supabase.channel(channelName, {
          config: {
            presence: {
              key: session.user.id
            }
          }
        })

        channel.subscribe((status, error) => {
          clearTimeout(timeout)

          if (status === 'SUBSCRIBED') {
            console.log(`✅ WebSocket channel active: ${channelName}`)
            this.channels.set(channelName, channel)
            this.retryCount = 0 // Reset retry count on success
            resolve(channel)
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.log(`🔄 WebSocket failed for ${channelName}, gracefully degrading (status: ${status})`)
            if (error) {
              console.log(`WebSocket error details:`, error.message)
            }
            resolve(null) // Graceful degradation
          }
        })
      })

    } catch (error) {
      console.log(`❌ Channel creation error for ${channelName}:`, error.message)

      // Following CLAUDE.md: Fail Fast, Fail Explicitly with graceful degradation
      console.log(`🔄 Gracefully degrading - channel ${channelName} will operate without realtime`)
      return null
    }
  }

  async removeChannel(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName)
    if (channel) {
      try {
        const supabase = await this.getSupabaseClient()
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