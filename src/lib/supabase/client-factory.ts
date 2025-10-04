/**
 * 🏭 Centralized Supabase Client Factory
 *
 * Long-term Best Practice Architecture:
 * - Single Source of Truth for all client instances
 * - Circuit Breaker pattern for connection failures
 * - Automatic retry with exponential backoff
 * - Connection health monitoring
 * - Graceful degradation for offline mode
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

interface ConnectionHealth {
  isHealthy: boolean
  lastCheck: Date
  failureCount: number
  nextRetryAt?: Date
}

interface ClientFactoryOptions {
  maxRetries: number
  baseRetryDelay: number
  maxRetryDelay: number
  circuitBreakerThreshold: number
  healthCheckInterval: number
}

const DEFAULT_OPTIONS: ClientFactoryOptions = {
  maxRetries: 3,
  baseRetryDelay: 1000, // 1초
  maxRetryDelay: 30000, // 30초
  circuitBreakerThreshold: 5, // 5번 실패 시 Circuit Breaker 작동
  healthCheckInterval: 30000 // 30초마다 health check
}

/**
 * 🛡️ Resilient Supabase Client Factory
 * Circuit Breaker + Retry + Health Monitoring
 */
export class SupabaseClientFactory {
  private static instance: SupabaseClientFactory
  private clientPromise: Promise<SupabaseClient> | null = null
  private connectionHealth: ConnectionHealth = {
    isHealthy: true,
    lastCheck: new Date(),
    failureCount: 0
  }
  private options: ClientFactoryOptions
  private healthCheckTimer: NodeJS.Timeout | null = null

  constructor(options: Partial<ClientFactoryOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.startHealthChecking()
  }

  /**
   * 🎯 Singleton Instance with Thread Safety
   */
  static getInstance(options?: Partial<ClientFactoryOptions>): SupabaseClientFactory {
    if (!SupabaseClientFactory.instance) {
      SupabaseClientFactory.instance = new SupabaseClientFactory(options)
    }
    return SupabaseClientFactory.instance
  }

  /**
   * 🔌 Get Resilient Supabase Client
   * Auto-retry + Circuit Breaker + Health Check
   */
  async getClient(): Promise<SupabaseClient> {
    // Circuit Breaker: 연결이 불안정하면 즉시 에러 반환
    if (!this.isCircuitOpen()) {
      if (!this.clientPromise) {
        this.clientPromise = this.createClientWithRetry()
      }
      return this.clientPromise
    }

    // Circuit Open: 최소한의 기능만 제공
    console.warn('🚨 Circuit Breaker OPEN: Supabase connection unstable')
    throw new Error('Supabase connection temporarily unavailable')
  }

  /**
   * 🔄 Create Client with Retry Logic
   */
  private async createClientWithRetry(): Promise<SupabaseClient> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        console.log(`🔄 Supabase client creation attempt ${attempt}/${this.options.maxRetries}`)

        const client = await createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Connection Test
        await this.testConnection(client)

        // Success: Reset failure count
        this.connectionHealth.isHealthy = true
        this.connectionHealth.failureCount = 0
        this.connectionHealth.lastCheck = new Date()

        console.log('✅ Supabase client created successfully')
        return client

      } catch (error: any) {
        lastError = error
        this.connectionHealth.failureCount++
        this.connectionHealth.isHealthy = false

        console.error(`❌ Supabase client creation failed (attempt ${attempt}):`, error.message)

        if (attempt < this.options.maxRetries) {
          const delay = this.calculateRetryDelay(attempt)
          console.log(`⏳ Retrying in ${delay}ms...`)
          await this.sleep(delay)
        }
      }
    }

    // All retries failed
    this.connectionHealth.nextRetryAt = new Date(Date.now() + this.options.maxRetryDelay)
    throw new Error(`Supabase connection failed after ${this.options.maxRetries} attempts: ${lastError?.message}`)
  }

  /**
   * 🧪 Connection Health Test
   */
  private async testConnection(client: SupabaseClient): Promise<void> {
    try {
      // Simple query to test connection - try hospitals table first
      const { error } = await client
        .from('hospitals')
        .select('id', { count: 'exact', head: true })
        .limit(1)

      if (error) {
        // Fallback to profiles table if hospitals doesn't exist
        const { error: profileError } = await client
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .limit(1)

        if (profileError && !profileError.message.includes('relation "profiles" does not exist')) {
          throw profileError
        }
      }
    } catch (error: any) {
      throw new Error(`Connection test failed: ${error.message}`)
    }
  }

  /**
   * ⚡ Circuit Breaker Logic
   */
  private isCircuitOpen(): boolean {
    const now = new Date()

    // Circuit Breaker 임계값 초과
    if (this.connectionHealth.failureCount >= this.options.circuitBreakerThreshold) {
      // 재시도 시간이 되었는지 확인
      if (this.connectionHealth.nextRetryAt && now < this.connectionHealth.nextRetryAt) {
        return true // Circuit still open
      }

      // 재시도 시간이 되었으면 Circuit Half-Open
      console.log('🔄 Circuit Breaker: Half-Open state, attempting reconnection...')
      this.connectionHealth.failureCount = Math.floor(this.options.circuitBreakerThreshold / 2)
    }

    return false
  }

  /**
   * 📊 Get Connection Health Status
   */
  getConnectionHealth(): ConnectionHealth & { circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' } {
    let circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

    if (this.connectionHealth.failureCount >= this.options.circuitBreakerThreshold) {
      const now = new Date()
      if (this.connectionHealth.nextRetryAt && now < this.connectionHealth.nextRetryAt) {
        circuitState = 'OPEN'
      } else {
        circuitState = 'HALF_OPEN'
      }
    }

    return {
      ...this.connectionHealth,
      circuitState
    }
  }

  /**
   * 🔄 Exponential Backoff Calculation
   */
  private calculateRetryDelay(attempt: number): number {
    const delay = this.options.baseRetryDelay * Math.pow(2, attempt - 1)
    const jitter = Math.random() * 1000 // Add jitter to prevent thundering herd
    return Math.min(delay + jitter, this.options.maxRetryDelay)
  }

  /**
   * ⏳ Sleep Utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 🏥 Background Health Checking
   */
  private startHealthChecking(): void {
    if (typeof window === 'undefined') return // Server-side에서는 실행하지 않음

    this.healthCheckTimer = setInterval(async () => {
      try {
        if (this.clientPromise) {
          const client = await this.clientPromise
          await this.testConnection(client)

          // Health check 성공
          if (!this.connectionHealth.isHealthy) {
            console.log('✅ Supabase connection recovered')
            this.connectionHealth.isHealthy = true
            this.connectionHealth.failureCount = Math.max(0, this.connectionHealth.failureCount - 1)
          }
        }
      } catch (error) {
        console.warn('⚠️ Health check failed:', (error as Error).message)
        this.connectionHealth.isHealthy = false
        this.connectionHealth.failureCount++
      }

      this.connectionHealth.lastCheck = new Date()
    }, this.options.healthCheckInterval)
  }

  /**
   * 🧹 Cleanup Resources
   */
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
      this.healthCheckTimer = null
    }
    this.clientPromise = null
    SupabaseClientFactory.instance = null as any
  }
}

/**
 * 🎯 Global Factory Instance
 */
export const supabaseClientFactory = SupabaseClientFactory.getInstance()

/**
 * 🚀 Convenience Function for Quick Access
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  return supabaseClientFactory.getClient()
}

/**
 * 📊 Get Connection Health Status
 */
export function getConnectionHealth() {
  return supabaseClientFactory.getConnectionHealth()
}