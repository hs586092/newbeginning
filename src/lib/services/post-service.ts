/**
 * Post Service Layer
 * Production-ready database service with error handling and fallback mechanisms
 */

import { createClient } from '@/lib/supabase/client'
import {
  DatabasePost,
  UnifiedPost,
  transformDatabasePosts,
  getFallbackPosts
} from '@/lib/data/post-transformer'

export interface PostServiceConfig {
  timeout?: number
  retryCount?: number
  fallbackEnabled?: boolean
}

const DEFAULT_CONFIG: Required<PostServiceConfig> = {
  timeout: 10000, // 10 seconds
  retryCount: 2,
  fallbackEnabled: true
}

/**
 * Retry mechanism with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  delay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries + 1) {
        throw error
      }

      console.warn(`🔄 Retry attempt ${attempt}/${maxRetries}:`, error instanceof Error ? error.message : error)
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw new Error('Max retry attempts reached')
}

/**
 * Enhanced Post Service with production-ready error handling
 */
export class PostService {
  private supabasePromise: Promise<any> | null = null
  private config: Required<PostServiceConfig>

  constructor(config: PostServiceConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  private async getSupabaseClient() {
    if (!this.supabasePromise) {
      this.supabasePromise = createClient()
    }
    return this.supabasePromise
  }

  /**
   * Fetch posts from database with comprehensive error handling
   */
  async getPosts(limit = 20): Promise<{
    data: UnifiedPost[]
    source: 'database' | 'fallback'
    error?: string
  }> {
    try {
      console.log(`🔍 Fetching posts from database (limit: ${limit})...`)

      const operation = async () => {
        const supabase = await this.getSupabaseClient()
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) {
          throw new Error(`Database query failed: ${error.message}`)
        }

        if (!data || data.length === 0) {
          console.log('ℹ️ No posts found in database')
          return []
        }

        console.log(`✅ Retrieved ${data.length} posts from database`)
        return data as DatabasePost[]
      }

      // Execute with retry mechanism
      const databasePosts = await withRetry(operation, this.config.retryCount)

      // Transform to unified format
      const transformedPosts = transformDatabasePosts(databasePosts)

      return {
        data: transformedPosts,
        source: 'database'
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error'
      console.error('🚨 Database operation failed:', errorMessage)

      // Return fallback data if enabled
      if (this.config.fallbackEnabled) {
        console.log('🔄 Switching to fallback posts...')
        return {
          data: getFallbackPosts(),
          source: 'fallback',
          error: errorMessage
        }
      }

      return {
        data: [],
        source: 'fallback',
        error: errorMessage
      }
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<{
    success: boolean
    latency?: number
    error?: string
  }> {
    const startTime = Date.now()

    try {
      console.log('🔍 Testing database connection...')

      const supabase = await this.getSupabaseClient()
      const { error } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .limit(1)

      const latency = Date.now() - startTime

      if (error) {
        throw new Error(error.message)
      }

      console.log(`✅ Database connection successful (${latency}ms)`)
      return {
        success: true,
        latency
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed'
      console.error('🚨 Database connection failed:', errorMessage)

      return {
        success: false,
        latency: Date.now() - startTime,
        error: errorMessage
      }
    }
  }

  /**
   * Get database statistics and health info
   */
  async getDatabaseInfo(): Promise<{
    postCount: number
    connection: boolean
    lastUpdated?: string
  }> {
    try {
      const supabase = await this.getSupabaseClient()
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)

      if (error) {
        throw new Error(error.message)
      }

      const { data: latestPost } = await supabase
        .from('posts')
        .select('created_at')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return {
        postCount: count || 0,
        connection: true,
        lastUpdated: latestPost?.created_at
      }

    } catch (error) {
      console.error('🚨 Failed to get database info:', error)
      return {
        postCount: 0,
        connection: false
      }
    }
  }
}

// Export singleton instance
export const postService = new PostService()

/**
 * Hook-style interface for easy React integration
 */
export async function usePosts(limit = 20) {
  return await postService.getPosts(limit)
}