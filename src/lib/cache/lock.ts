/**
 * Distributed Lock System
 *
 * Prevents duplicate crawling with 30-second TTL locks
 * Includes exponential backoff and probabilistic cleanup
 */

import { createClient } from '@/lib/supabase/server'
import { config } from '@/lib/config'

/**
 * Acquire a distributed lock for a resource
 *
 * @param lockKey - Unique identifier for the locked resource (e.g., "crawl:강남스타벅스")
 * @param requestId - Request ID for debugging and monitoring
 * @returns true if lock acquired successfully, false if already locked
 */
export async function acquireLock(
  lockKey: string,
  requestId: string
): Promise<boolean> {
  const supabase = await createClient()

  // Probabilistic cleanup (10% chance)
  if (Math.random() < config.lock.cleanup_probability) {
    await cleanupExpiredLocks()
  }

  const expiresAt = new Date(Date.now() + config.lock.ttl_ms).toISOString()

  try {
    const { error } = await supabase
      .from('cache_locks')
      .insert({
        lock_key: lockKey,
        expires_at: expiresAt,
        request_id: requestId
      })

    // Insert succeeded = lock acquired
    return !error
  } catch (err: any) {
    // Duplicate key error = lock already exists
    if (err.code === '23505') {
      return false
    }
    throw err
  }
}

/**
 * Release a distributed lock
 *
 * @param lockKey - Unique identifier for the locked resource
 */
export async function releaseLock(lockKey: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('cache_locks')
    .delete()
    .eq('lock_key', lockKey)
}

/**
 * Wait for a lock to be released with exponential backoff
 *
 * Retry strategy:
 * - Attempt 1: wait 0.5s
 * - Attempt 2: wait 1s
 * - Attempt 3: wait 2s
 * - Attempt 4: wait 3s
 * - Attempt 5: wait 3s (max)
 *
 * @param lockKey - Unique identifier for the locked resource
 * @returns true if lock was released, false if timeout
 */
export async function waitForLockRelease(lockKey: string): Promise<boolean> {
  const supabase = await createClient()

  let waitTime = config.lock.initial_wait_ms
  let attempts = 0

  while (attempts < config.lock.max_attempts) {
    // Wait before checking
    await new Promise(resolve => setTimeout(resolve, waitTime))

    // Check if lock still exists
    const { data, error } = await supabase
      .from('cache_locks')
      .select('expires_at')
      .eq('lock_key', lockKey)
      .maybeSingle()

    // Lock released or expired
    if (error || !data) {
      return true
    }

    // Check if lock expired (shouldn't happen with auto-cleanup, but safety check)
    const expired = new Date(data.expires_at).getTime() < Date.now()
    if (expired) {
      await releaseLock(lockKey) // Clean up expired lock
      return true
    }

    // Exponential backoff
    waitTime = Math.min(waitTime * 2, config.lock.max_wait_ms)
    attempts++
  }

  // Timeout - lock still held after max attempts
  return false
}

/**
 * Check if a lock exists for a resource
 *
 * @param lockKey - Unique identifier for the locked resource
 * @returns true if lock exists and is not expired
 */
export async function isLocked(lockKey: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cache_locks')
    .select('expires_at')
    .eq('lock_key', lockKey)
    .maybeSingle()

  if (error || !data) {
    return false
  }

  // Check if expired
  const expired = new Date(data.expires_at).getTime() < Date.now()
  if (expired) {
    await releaseLock(lockKey) // Clean up expired lock
    return false
  }

  return true
}

/**
 * Clean up expired locks
 * Called probabilistically (10% chance per acquireLock) or via pg_cron
 *
 * @returns Number of locks deleted
 */
export async function cleanupExpiredLocks(): Promise<number> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .rpc('cleanup_expired_locks')

    if (error) {
      console.error('Failed to cleanup expired locks:', error)
      return 0
    }

    return data || 0
  } catch (err) {
    console.error('Error in cleanupExpiredLocks:', err)
    return 0
  }
}
