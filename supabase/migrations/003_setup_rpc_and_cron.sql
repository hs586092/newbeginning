-- Migration 003: Setup RPC functions and pg_cron for automated cleanup
-- Purpose: Efficient lock cleanup and cache management

-- ===== RPC Function: Atomic is_revalidating flag =====
-- Prevents race condition when marking place for revalidation
CREATE OR REPLACE FUNCTION mark_for_revalidation(place_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE place_summaries
  SET is_revalidating = true
  WHERE id = place_id
    AND is_revalidating = false;  -- Only update if not already revalidating

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;  -- Return true if update succeeded
END;
$$;

COMMENT ON FUNCTION mark_for_revalidation IS 'Atomically mark a place for revalidation (prevents race condition)';


-- ===== RPC Function: Cleanup expired locks =====
-- Used for probabilistic cleanup (10% chance per acquireLock call)
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM cache_locks
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_expired_locks IS 'Remove expired locks (called probabilistically or via pg_cron)';


-- ===== pg_cron: Scheduled lock cleanup =====
-- NOTE: pg_cron extension must be activated in Supabase dashboard first!
-- Dashboard → Database → Extensions → Enable "pg_cron"

-- Check if pg_cron is available
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Schedule cleanup every 5 minutes
    PERFORM cron.schedule(
      'cleanup-expired-locks',
      '*/5 * * * *',  -- Every 5 minutes
      $sql$ SELECT cleanup_expired_locks() $sql$
    );

    RAISE NOTICE 'pg_cron job scheduled: cleanup-expired-locks (every 5 minutes)';
  ELSE
    RAISE WARNING 'pg_cron extension not found. Please enable it in Supabase dashboard: Database → Extensions → pg_cron';
  END IF;
END;
$$;


-- ===== Optional: View for monitoring lock status =====
CREATE OR REPLACE VIEW active_locks AS
SELECT
  lock_key,
  acquired_at,
  expires_at,
  request_id,
  EXTRACT(EPOCH FROM (expires_at - NOW())) AS remaining_seconds
FROM cache_locks
WHERE expires_at > NOW()
ORDER BY acquired_at DESC;

COMMENT ON VIEW active_locks IS 'Currently active locks with remaining time';
