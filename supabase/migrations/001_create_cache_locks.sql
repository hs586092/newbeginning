-- Migration 001: Create cache_locks table for distributed locking
-- Purpose: Prevent duplicate crawling with 30-second TTL locks

CREATE TABLE IF NOT EXISTS cache_locks (
  lock_key TEXT PRIMARY KEY,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  request_id TEXT NOT NULL
);

-- Index for efficient cleanup of expired locks
CREATE INDEX idx_cache_locks_expires_at ON cache_locks(expires_at);

-- Comment for documentation
COMMENT ON TABLE cache_locks IS 'Distributed locks to prevent duplicate crawling operations';
COMMENT ON COLUMN cache_locks.lock_key IS 'Unique identifier for the locked resource (e.g., "crawl:normalized_name")';
COMMENT ON COLUMN cache_locks.expires_at IS 'Lock auto-expires after 30 seconds to prevent deadlocks';
COMMENT ON COLUMN cache_locks.request_id IS 'Request ID for debugging and monitoring';
