/**
 * Place Summary Types
 *
 * Core type definitions for the moree.ai place review summary system
 */

export interface PlaceSummary {
  // Database fields
  id?: string

  // Place identification
  placeName: string
  place_name_original: string
  place_name_normalized?: string
  naver_place_id?: string

  // Review summary
  summary: string
  pros: string[]
  cons: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  reviewCount: number

  // Source
  naverMapUrl: string

  // Cache metadata
  cached_at?: string
  expires_at?: string
  request_count?: number
  is_revalidating?: boolean
  revalidation_started_at?: string
  last_requested_at?: string
}

export interface MetricsTracker {
  // Timing functions
  startCrawl: () => number
  endCrawl: (start: number) => void
  startAI: () => number
  endAI: (start: number) => void
  startDB: () => number
  endDB: (start: number) => void

  // Status recording
  recordCacheHit: (type: 'fresh' | 'stale') => void
  recordError: (error: any, stage: 'crawl' | 'ai' | 'db' | 'lock') => void

  // Save metrics
  save: () => Promise<void>
}

export interface ApiResponse {
  status: 'cached' | 'stale' | 'fresh' | 'degraded' | 'minimal'
  data: PlaceSummary
  is_fresh?: boolean
  message?: string
  warning?: string
  error?: string
}

export interface PerformanceMetrics {
  search_query: string
  place_name_normalized: string
  request_id: string

  crawl_time_ms?: number
  ai_summary_time_ms?: number
  db_save_time_ms?: number
  total_time_ms: number

  cache_hit: boolean
  cache_type: 'fresh' | 'stale' | 'miss' | 'degraded' | 'minimal'

  error?: string
  error_stage?: 'crawl' | 'ai' | 'db' | 'lock'
}
