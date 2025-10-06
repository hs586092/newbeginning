-- Migration 002: Create performance_metrics table for monitoring
-- Purpose: Track crawl/AI/DB performance with 10% sampling rate

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Request identification
  request_id TEXT NOT NULL,
  search_query TEXT NOT NULL,
  place_name_normalized TEXT NOT NULL,

  -- Performance timing (milliseconds)
  crawl_time_ms INTEGER,
  ai_summary_time_ms INTEGER,
  db_save_time_ms INTEGER,
  total_time_ms INTEGER NOT NULL,

  -- Cache hit information
  cache_hit BOOLEAN NOT NULL,
  cache_type TEXT NOT NULL CHECK (cache_type IN ('fresh', 'stale', 'miss', 'degraded', 'minimal')),

  -- Error tracking
  error TEXT,
  error_stage TEXT CHECK (error_stage IN ('crawl', 'ai', 'db', 'lock'))
);

-- Indexes for efficient querying
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at DESC);
CREATE INDEX idx_performance_metrics_cache_type ON performance_metrics(cache_type);
CREATE INDEX idx_performance_metrics_error_stage ON performance_metrics(error_stage) WHERE error_stage IS NOT NULL;

-- Comment for documentation
COMMENT ON TABLE performance_metrics IS 'Performance monitoring with 10% sampling + all errors/slow requests';
COMMENT ON COLUMN performance_metrics.cache_type IS 'fresh=<7d, stale=>7d, miss=new crawl, degraded=fallback, minimal=no data';
COMMENT ON COLUMN performance_metrics.error_stage IS 'Stage where error occurred: crawl, ai, db, or lock';
