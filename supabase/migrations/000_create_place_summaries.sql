-- Migration 000: Create place_summaries table (main cache table)
-- Purpose: Store place review summaries with cache metadata

CREATE TABLE IF NOT EXISTS place_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Place identification (3-level cache key)
  place_name_original TEXT NOT NULL,
  place_name_normalized TEXT UNIQUE NOT NULL,  -- Token-sorted normalized name
  naver_place_id TEXT,  -- Naver's unique place ID (if available)

  -- Place summary data
  placeName TEXT NOT NULL,
  summary TEXT NOT NULL,
  pros TEXT[] NOT NULL DEFAULT '{}',
  cons TEXT[] NOT NULL DEFAULT '{}',
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  reviewCount INTEGER NOT NULL DEFAULT 0,
  naverMapUrl TEXT NOT NULL,

  -- Cache metadata
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  last_requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Revalidation metadata (for Stale-While-Revalidate)
  is_revalidating BOOLEAN NOT NULL DEFAULT false,
  revalidation_started_at TIMESTAMPTZ
);

-- Indexes for efficient cache lookup
CREATE INDEX idx_place_summaries_normalized ON place_summaries(place_name_normalized);
CREATE INDEX idx_place_summaries_naver_id ON place_summaries(naver_place_id) WHERE naver_place_id IS NOT NULL;
CREATE INDEX idx_place_summaries_expires_at ON place_summaries(expires_at);
CREATE INDEX idx_place_summaries_revalidating ON place_summaries(is_revalidating) WHERE is_revalidating = true;

-- Comments for documentation
COMMENT ON TABLE place_summaries IS 'Cached place review summaries with 7-day TTL';
COMMENT ON COLUMN place_summaries.place_name_normalized IS 'Token-sorted normalized name for cache key matching';
COMMENT ON COLUMN place_summaries.naver_place_id IS 'Naver Place ID (most reliable cache key when available)';
COMMENT ON COLUMN place_summaries.expires_at IS 'Cache expiration timestamp (7 days from cached_at)';
COMMENT ON COLUMN place_summaries.is_revalidating IS 'True when stale cache is being revalidated by next user';
COMMENT ON COLUMN place_summaries.request_count IS 'Total number of requests for this place (popularity metric)';
