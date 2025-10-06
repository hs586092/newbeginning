/**
 * Cache Query Functions
 *
 * 3-level cache key lookup strategy:
 * Level 1: naver_place_id (most reliable)
 * Level 2: normalized_name (token-sorted)
 * Level 3: search query (original user input)
 */

import { createClient } from '@/lib/supabase/server'
import { PlaceSummary } from '@/types/place'
import { config } from '@/lib/config'

/**
 * Check if cached data is fresh (within TTL)
 */
function isFresh(cachedAt: string): boolean {
  const cacheAge = Date.now() - new Date(cachedAt).getTime()
  return cacheAge < config.cache.default_ttl_ms
}

/**
 * Level 1: Query by Naver Place ID (most reliable)
 *
 * @param naverPlaceId - Naver's unique place identifier
 * @returns Fresh or stale cache entry, or null if not found
 */
export async function getCacheByPlaceId(
  naverPlaceId: string
): Promise<{ fresh: PlaceSummary | null; stale: PlaceSummary | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('place_summaries')
    .select('*')
    .eq('naver_place_id', naverPlaceId)
    .maybeSingle()

  if (error || !data) {
    return { fresh: null, stale: null }
  }

  if (data.cached_at && isFresh(data.cached_at)) {
    return { fresh: data, stale: null }
  } else {
    return { fresh: null, stale: data }
  }
}

/**
 * Level 2: Query by normalized place name
 *
 * @param normalizedName - Token-sorted normalized name
 * @returns Fresh or stale cache entry, or null if not found
 */
export async function getCacheByNormalizedName(
  normalizedName: string
): Promise<{ fresh: PlaceSummary | null; stale: PlaceSummary | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('place_summaries')
    .select('*')
    .eq('place_name_normalized', normalizedName)
    .maybeSingle()

  if (error || !data) {
    return { fresh: null, stale: null }
  }

  if (data.cached_at && isFresh(data.cached_at)) {
    return { fresh: data, stale: null }
  } else {
    return { fresh: null, stale: data }
  }
}

/**
 * Level 3: Fallback to any cached data (even very stale)
 * Used for graceful degradation when fresh crawl fails
 *
 * @param normalizedName - Token-sorted normalized name
 * @returns Any cached data, regardless of age
 */
export async function getCacheAny(
  normalizedName: string
): Promise<PlaceSummary | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('place_summaries')
    .select('*')
    .eq('place_name_normalized', normalizedName)
    .order('cached_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Update last_requested_at timestamp for cache entry
 * Used for popularity tracking and cache eviction policies
 *
 * @param placeId - Database ID of the place summary
 */
export async function touchCache(placeId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('place_summaries')
    .update({
      last_requested_at: new Date().toISOString(),
      request_count: supabase.rpc('increment', { row_id: placeId, column: 'request_count' })
    })
    .eq('id', placeId)
}

/**
 * Atomically mark a place for revalidation (prevents race condition)
 * Uses RPC function from migration 003
 *
 * @param placeId - Database ID of the place summary
 * @returns true if successfully marked (this request should handle revalidation)
 */
export async function markForRevalidation(placeId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('mark_for_revalidation', { place_id: placeId })

  if (error) {
    console.error('Failed to mark for revalidation:', error)
    return false
  }

  return !!data
}
