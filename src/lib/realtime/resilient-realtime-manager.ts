/**
 * 🌐 Resilient Realtime Manager
 *
 * Long-term Best Practice WebSocket Architecture:
 * - Progressive Enhancement: WebSocket → Polling fallback
 * - Connection state management with auto-reconnection
 * - Exponential backoff for failed connections
 * - Graceful degradation for offline scenarios
 * - Circuit Breaker pattern for unstable connections
 */

import { RealtimeChannel, RealtimeChannelSendResponse } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client-factory'

interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'failed' | 'polling'
  lastConnected?: Date
  reconnectAttempts: number
  usePolling: boolean
  error?: string
}

interface SubscriptionConfig {
  table: string
  filter?: string
  callback: (payload: any) => void
  errorCallback?: (error: Error) => void
}

interface PollingConfig {
  interval: number
  maxPollingAttempts: number
  enabled: boolean
}

const DEFAULT_POLLING_CONFIG: PollingConfig = {
  interval: 5000, // 5초마다 polling
  maxPollingAttempts: 10,
  enabled: true
}

/**
 * 🛡️ Resilient Realtime Connection Manager
 * WebSocket with Polling Fallback + Circuit Breaker
 */
export class ResilientRealtimeManager {
  private static instance: ResilientRealtimeManager
  private connectionState: ConnectionState = {
    status: 'disconnected',
    reconnectAttempts: 0,
    usePolling: false
  }

  private channels: Map<string, RealtimeChannel> = new Map()
  private subscriptions: Map<string, SubscriptionConfig> = new Map()
  private pollingTimers: Map<string, NodeJS.Timeout> = new Map()
  private pollingConfig: PollingConfig = DEFAULT_POLLING_CONFIG
  private reconnectTimer: NodeJS.Timeout | null = null
  private lastDataCache: Map<string, any[]> = new Map()

  /**
   * 🎯 Singleton Pattern
   */
  static getInstance(): ResilientRealtimeManager {
    if (!ResilientRealtimeManager.instance) {
      ResilientRealtimeManager.instance = new ResilientRealtimeManager()
    }
    return ResilientRealtimeManager.instance
  }

  /**
   * 🔌 Initialize Connection with Fallback Strategy
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing Resilient Realtime Manager...')
      this.connectionState.status = 'connecting'

      await this.attemptWebSocketConnection()

    } catch (error: any) {
      console.error('❌ WebSocket initialization failed:', error.message)

      if (this.pollingConfig.enabled) {
        console.log('🔄 Falling back to polling mode...')
        this.fallbackToPolling()
      } else {
        this.connectionState = {
          ...this.connectionState,
          status: 'failed',
          error: error.message
        }
      }
    }
  }

  /**
   * 🌐 Attempt WebSocket Connection
   */
  private async attemptWebSocketConnection(): Promise<void> {
    try {
      const supabase = await getSupabaseClient()

      // Test connection with a simple operation
      const testChannel = supabase.channel('connection-test')

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'))
        }, 10000) // 10초 타임아웃

        testChannel
          .on('presence', { event: 'sync' }, () => {
            clearTimeout(timeout)
            resolve()
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              clearTimeout(timeout)
              resolve()
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              clearTimeout(timeout)
              reject(new Error(`WebSocket subscription failed: ${status}`))
            }
          })
      })

      // Clean up test channel
      supabase.removeChannel(testChannel)

      // Success
      this.connectionState = {
        status: 'connected',
        lastConnected: new Date(),
        reconnectAttempts: 0,
        usePolling: false
      }

      console.log('✅ WebSocket connection established')

      // Re-establish existing subscriptions
      await this.reestablishSubscriptions()

    } catch (error: any) {
      this.connectionState.reconnectAttempts++
      console.error(`❌ WebSocket connection attempt ${this.connectionState.reconnectAttempts} failed:`, error.message)

      // Circuit Breaker: Too many failures, switch to polling
      if (this.connectionState.reconnectAttempts >= 3) {
        throw new Error('WebSocket connection persistently failing, switching to polling mode')
      }

      // Exponential backoff retry
      const retryDelay = Math.min(1000 * Math.pow(2, this.connectionState.reconnectAttempts), 30000)
      console.log(`⏳ Retrying WebSocket connection in ${retryDelay}ms...`)

      await new Promise(resolve => setTimeout(resolve, retryDelay))
      await this.attemptWebSocketConnection()
    }
  }

  /**
   * 📡 Subscribe to Realtime Updates
   */
  async subscribe(key: string, config: SubscriptionConfig): Promise<void> {
    this.subscriptions.set(key, config)

    if (this.connectionState.status === 'connected') {
      await this.createWebSocketSubscription(key, config)
    } else if (this.connectionState.usePolling) {
      this.createPollingSubscription(key, config)
    } else {
      console.warn(`⚠️ Cannot subscribe to ${key}: connection not ready`)
    }
  }

  /**
   * 🌐 Create WebSocket Subscription
   */
  private async createWebSocketSubscription(key: string, config: SubscriptionConfig): Promise<void> {
    try {
      const supabase = await getSupabaseClient()
      const channel = supabase.channel(key)

      const eventConfig = config.filter
        ? { event: '*', filter: config.filter }
        : { event: '*' }

      channel
        .on('postgres_changes', { ...eventConfig, schema: 'public', table: config.table }, (payload) => {
          console.log(`📡 WebSocket update for ${key}:`, payload)
          config.callback(payload)
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ WebSocket subscription active: ${key}`)
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(`❌ WebSocket subscription failed: ${key}, status: ${status}`)

            if (config.errorCallback) {
              config.errorCallback(new Error(`Subscription failed: ${status}`))
            }

            // Fallback to polling for this subscription
            if (this.pollingConfig.enabled) {
              console.log(`🔄 Falling back to polling for ${key}`)
              this.createPollingSubscription(key, config)
            }
          }
        })

      this.channels.set(key, channel)

    } catch (error: any) {
      console.error(`❌ Failed to create WebSocket subscription for ${key}:`, error.message)

      if (config.errorCallback) {
        config.errorCallback(error)
      }

      // Fallback to polling
      if (this.pollingConfig.enabled) {
        this.createPollingSubscription(key, config)
      }
    }
  }

  /**
   * 📊 Create Polling Subscription (Fallback)
   */
  private createPollingSubscription(key: string, config: SubscriptionConfig): void {
    console.log(`📊 Setting up polling subscription for ${key}`)

    const pollData = async () => {
      try {
        const supabase = await getSupabaseClient()
        let query = supabase.from(config.table).select('*')

        // Apply filter if specified
        if (config.filter) {
          // Simple filter parsing (can be enhanced)
          const [column, operator, value] = config.filter.split(' ')
          if (column && operator && value) {
            query = query.filter(column, operator, value)
          }
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error

        // Check for changes compared to last cache
        const lastData = this.lastDataCache.get(key)
        if (!lastData || JSON.stringify(data) !== JSON.stringify(lastData)) {
          this.lastDataCache.set(key, data)

          // Simulate realtime payload format
          const payload = {
            eventType: 'UPDATE',
            new: data?.[0] || null,
            old: null,
            schema: 'public',
            table: config.table
          }

          config.callback(payload)
          console.log(`📊 Polling update detected for ${key}`)
        }

      } catch (error: any) {
        console.error(`❌ Polling failed for ${key}:`, error.message)

        if (config.errorCallback) {
          config.errorCallback(error)
        }
      }
    }

    // Initial poll
    pollData()

    // Set up periodic polling
    const timer = setInterval(pollData, this.pollingConfig.interval)
    this.pollingTimers.set(key, timer)

    console.log(`📊 Polling subscription active: ${key} (interval: ${this.pollingConfig.interval}ms)`)
  }

  /**
   * 🔄 Fallback to Polling Mode
   */
  private fallbackToPolling(): void {
    this.connectionState = {
      status: 'polling',
      reconnectAttempts: 0,
      usePolling: true,
      lastConnected: new Date()
    }

    console.log('📊 Switched to polling mode for all subscriptions')

    // Convert existing subscriptions to polling
    for (const [key, config] of this.subscriptions) {
      this.createPollingSubscription(key, config)
    }

    // Schedule periodic WebSocket retry
    this.scheduleReconnection()
  }

  /**
   * ⏰ Schedule WebSocket Reconnection Attempts
   */
  private scheduleReconnection(): void {
    if (this.reconnectTimer) return

    this.reconnectTimer = setInterval(async () => {
      if (this.connectionState.usePolling) {
        console.log('🔄 Attempting WebSocket reconnection from polling mode...')

        try {
          await this.attemptWebSocketConnection()

          // Success: Switch back from polling to WebSocket
          console.log('✅ Reconnected to WebSocket, switching from polling mode')
          this.switchFromPollingToWebSocket()

          if (this.reconnectTimer) {
            clearInterval(this.reconnectTimer)
            this.reconnectTimer = null
          }

        } catch (error) {
          console.log('🔄 WebSocket reconnection failed, continuing with polling mode')
        }
      }
    }, 60000) // Try reconnection every 1 minute
  }

  /**
   * 🔄 Switch from Polling to WebSocket
   */
  private async switchFromPollingToWebSocket(): Promise<void> {
    // Clear all polling timers
    for (const [key, timer] of this.pollingTimers) {
      clearInterval(timer)
    }
    this.pollingTimers.clear()

    // Re-establish WebSocket subscriptions
    await this.reestablishSubscriptions()

    this.connectionState.usePolling = false
    console.log('✅ Successfully switched from polling to WebSocket mode')
  }

  /**
   * 🔄 Re-establish All Subscriptions
   */
  private async reestablishSubscriptions(): Promise<void> {
    for (const [key, config] of this.subscriptions) {
      await this.createWebSocketSubscription(key, config)
    }
  }

  /**
   * 🚫 Unsubscribe from Updates
   */
  unsubscribe(key: string): void {
    // Remove WebSocket channel
    const channel = this.channels.get(key)
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(key)
    }

    // Clear polling timer
    const timer = this.pollingTimers.get(key)
    if (timer) {
      clearInterval(timer)
      this.pollingTimers.delete(key)
    }

    // Remove subscription config
    this.subscriptions.delete(key)
    this.lastDataCache.delete(key)

    console.log(`🚫 Unsubscribed from ${key}`)
  }

  /**
   * 📊 Get Connection Status
   */
  getConnectionStatus(): ConnectionState & {
    activeSubscriptions: number
    pollingSubscriptions: number
  } {
    return {
      ...this.connectionState,
      activeSubscriptions: this.channels.size,
      pollingSubscriptions: this.pollingTimers.size
    }
  }

  /**
   * 🧹 Cleanup All Resources
   */
  destroy(): void {
    // Clear all WebSocket channels
    for (const [key, channel] of this.channels) {
      channel.unsubscribe()
    }
    this.channels.clear()

    // Clear all polling timers
    for (const [key, timer] of this.pollingTimers) {
      clearInterval(timer)
    }
    this.pollingTimers.clear()

    // Clear reconnection timer
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // Clear state
    this.subscriptions.clear()
    this.lastDataCache.clear()

    ResilientRealtimeManager.instance = null as any
    console.log('🧹 Resilient Realtime Manager destroyed')
  }
}

/**
 * 🎯 Global Manager Instance
 */
export const resilientRealtimeManager = ResilientRealtimeManager.getInstance()

/**
 * 🚀 Convenience Functions
 */
export async function initializeResilientRealtime(): Promise<void> {
  await resilientRealtimeManager.initialize()
}

export async function subscribeToRealtime(
  key: string,
  table: string,
  callback: (payload: any) => void,
  filter?: string,
  errorCallback?: (error: Error) => void
): Promise<void> {
  await resilientRealtimeManager.subscribe(key, {
    table,
    filter,
    callback,
    errorCallback
  })
}

export function unsubscribeFromRealtime(key: string): void {
  resilientRealtimeManager.unsubscribe(key)
}

export function getRealtimeConnectionStatus() {
  return resilientRealtimeManager.getConnectionStatus()
}