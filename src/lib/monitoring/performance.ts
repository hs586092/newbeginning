/**
 * Performance Monitoring System
 *
 * Tracks crawl/AI/DB performance with 10% sampling rate
 * Always logs errors and slow requests
 */

import { createClient } from '@/lib/supabase/server'
import { PerformanceMetrics } from '@/types/place'
import { config } from '@/lib/config'

/**
 * Create a performance metrics tracker for a request
 *
 * @param searchQuery - Original user search query
 * @param placeNameNormalized - Normalized place name for cache key
 * @param requestId - Unique request identifier
 * @returns MetricsTracker object with timing and recording functions
 */
export function createMetricsTracker(
  searchQuery: string,
  placeNameNormalized: string,
  requestId: string
) {
  const metrics: PerformanceMetrics = {
    search_query: searchQuery,
    place_name_normalized: placeNameNormalized,
    request_id: requestId,
    total_time_ms: 0,
    cache_hit: false,
    cache_type: 'miss'
  }

  const startTime = Date.now()

  return {
    // Timing functions
    startCrawl: () => Date.now(),
    endCrawl: (start: number) => {
      metrics.crawl_time_ms = Date.now() - start
    },

    startAI: () => Date.now(),
    endAI: (start: number) => {
      metrics.ai_summary_time_ms = Date.now() - start
    },

    startDB: () => Date.now(),
    endDB: (start: number) => {
      metrics.db_save_time_ms = Date.now() - start
    },

    // Status recording
    recordCacheHit: (type: 'fresh' | 'stale') => {
      metrics.cache_hit = true
      metrics.cache_type = type
    },

    recordError: (error: any, stage: 'crawl' | 'ai' | 'db' | 'lock') => {
      metrics.error = error?.message || String(error)
      metrics.error_stage = stage
    },

    // Save metrics to database
    save: async () => {
      metrics.total_time_ms = Date.now() - startTime

      // Sampling logic: 10% of successful requests + all errors/slow requests
      const shouldLog = shouldLogMetrics(metrics)

      if (!shouldLog) {
        return // Skip logging for sampled-out successful fast requests
      }

      try {
        const supabase = await createClient()
        const { error } = await supabase
          .from('performance_metrics')
          .insert(metrics)

        if (error) {
          console.error('Failed to save performance metrics:', error)
        }
      } catch (err) {
        // Don't throw - metrics logging should never break the main flow
        console.error('Error saving performance metrics:', err)
      }
    }
  }
}

/**
 * Determine if metrics should be logged based on sampling rules
 *
 * Always log:
 * - Errors (any stage)
 * - Slow requests (>5 seconds)
 * - Very slow requests (>10 seconds)
 *
 * Sample 10% of:
 * - Successful requests
 * - Fast requests (<5 seconds)
 *
 * @param metrics - Performance metrics to evaluate
 * @returns true if metrics should be logged
 */
function shouldLogMetrics(metrics: PerformanceMetrics): boolean {
  // Always log errors
  if (metrics.error) {
    return true
  }

  // Always log slow requests
  if (metrics.total_time_ms > config.monitoring.slow_request_threshold_ms) {
    return true
  }

  // Always log very slow requests
  if (metrics.total_time_ms > config.monitoring.very_slow_request_threshold_ms) {
    return true
  }

  // Sample 10% of successful fast requests
  return Math.random() < config.monitoring.sampling_rate
}

/**
 * Helper function to generate unique request ID
 * Format: timestamp-randomhex
 * Example: 1704067200000-a3f9c2
 */
export function generateRequestId(): string {
  const timestamp = Date.now()
  const randomHex = Math.random().toString(16).substring(2, 8)
  return `${timestamp}-${randomHex}`
}
