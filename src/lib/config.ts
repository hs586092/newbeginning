/**
 * Configuration Settings
 *
 * Environment-specific settings for cache TTL, lock timeouts, and performance thresholds
 */

export const config = {
  // Cache TTL Strategy (Hierarchical)
  cache: {
    // Static data (place info rarely changes)
    static_ttl_days: 30,
    static_ttl_ms: 30 * 24 * 60 * 60 * 1000, // 30 days

    // Dynamic data (reviews change often)
    dynamic_ttl_days: 3,
    dynamic_ttl_ms: 3 * 24 * 60 * 60 * 1000, // 3 days

    // Realtime data (trending places)
    realtime_ttl_hours: 1,
    realtime_ttl_ms: 1 * 60 * 60 * 1000, // 1 hour

    // Default TTL for moree.ai (balance between freshness and cost)
    default_ttl_days: 7,
    default_ttl_ms: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // Distributed Lock Settings
  lock: {
    ttl_seconds: 30,
    ttl_ms: 30 * 1000, // 30 seconds

    // Exponential backoff for waitForLockRelease
    initial_wait_ms: 500,
    max_wait_ms: 3000,
    max_attempts: 5,

    // Probabilistic cleanup (10% chance per acquireLock call)
    cleanup_probability: 0.1,
  },

  // Performance Monitoring
  monitoring: {
    // Sample 10% of successful requests + all errors/slow requests
    sampling_rate: 0.1,

    // Thresholds for automatic logging
    slow_request_threshold_ms: 5000,
    very_slow_request_threshold_ms: 10000,
  },

  // Timeout Settings (Vercel limits)
  timeout: {
    // Vercel Hobby: 10s, Pro: 30s with maxDuration export
    vercel_hobby_ms: 10000,
    vercel_pro_ms: 30000,

    // Crawler timeout (leave buffer for AI + DB)
    crawler_timeout_ms: 15000,

    // AI summary timeout
    ai_timeout_ms: 8000,

    // Database operation timeout
    db_timeout_ms: 3000,
  },

  // Graceful Degradation Levels
  degradation: {
    // Return cached data even if very stale (>30 days)
    max_stale_days: 30,
    max_stale_ms: 30 * 24 * 60 * 60 * 1000,

    // Minimal response fields when no cache available
    minimal_fields: ['placeName', 'naverMapUrl'],
  },
}
