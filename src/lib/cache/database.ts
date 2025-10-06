/**
 * Cache Database Operations
 *
 * Save and update place summaries in Supabase
 */

import { createClient } from '@/lib/supabase/server'
import { PlaceSummary } from '@/types/place'
import { config } from '@/lib/config'

/**
 * Save or update a place summary in the cache
 *
 * @param summary - Place summary data to save
 * @param normalizedName - Token-sorted normalized name for cache key
 * @returns Saved place summary with database ID
 */
export async function savePlaceSummary(
  summary: PlaceSummary,
  normalizedName: string
): Promise<PlaceSummary> {
  const supabase = await createClient()

  const now = new Date().toISOString()
  const expiresAt = new Date(
    Date.now() + config.cache.default_ttl_ms
  ).toISOString()

  const dataToSave = {
    ...summary,
    place_name_normalized: normalizedName,
    cached_at: now,
    expires_at: expiresAt,
    request_count: 1,
    is_revalidating: false,
    revalidation_started_at: null,
    last_requested_at: now
  }

  // Upsert: Update if exists (by normalized name), insert if new
  const { data, error } = await supabase
    .from('place_summaries')
    .upsert(dataToSave, {
      onConflict: 'place_name_normalized',
      ignoreDuplicates: false
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save place summary: ${error.message}`)
  }

  return data
}

/**
 * Update revalidation status after completion
 *
 * @param placeId - Database ID of the place summary
 * @param newSummary - Updated place summary data
 */
export async function finishRevalidation(
  placeId: string,
  newSummary: PlaceSummary
): Promise<void> {
  const supabase = await createClient()

  const now = new Date().toISOString()
  const expiresAt = new Date(
    Date.now() + config.cache.default_ttl_ms
  ).toISOString()

  await supabase
    .from('place_summaries')
    .update({
      ...newSummary,
      cached_at: now,
      expires_at: expiresAt,
      is_revalidating: false,
      revalidation_started_at: null,
      last_requested_at: now
    })
    .eq('id', placeId)
}

/**
 * Reset revalidation flag if revalidation failed
 *
 * @param placeId - Database ID of the place summary
 */
export async function resetRevalidation(placeId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('place_summaries')
    .update({
      is_revalidating: false,
      revalidation_started_at: null
    })
    .eq('id', placeId)
}
