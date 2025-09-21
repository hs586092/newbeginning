/**
 * UUID validation utilities
 * Prevents INVALID UUID errors in Supabase RPC calls
 */

/**
 * Check if a string is a valid UUID v4 format
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false
  
  // UUID v4 regex pattern
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  return uuidV4Regex.test(uuid)
}

/**
 * Check if a UUID is a dummy/test UUID (all same digits)
 */
export function isDummyUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return true
  
  // Check for patterns like 11111111-1111-1111-1111-111111111111
  const dummyPatterns = [
    /^1{8}-1{4}-1{4}-1{4}-1{12}$/,
    /^2{8}-2{4}-2{4}-2{4}-2{12}$/,
    /^3{8}-3{4}-3{4}-3{4}-3{12}$/,
    /^4{8}-4{4}-4{4}-4{4}-4{12}$/,
    /^0{8}-0{4}-0{4}-0{4}-0{12}$/
  ]
  
  return dummyPatterns.some(pattern => pattern.test(uuid))
}

/**
 * Validate UUID for Supabase operations
 * Returns true if UUID is safe to use in RPC calls
 */
export function isValidForSupabase(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    console.debug('UUID Validation: Empty or non-string UUID provided:', uuid)
    return false
  }

  if (!isValidUUID(uuid)) {
    console.debug('UUID Validation: Invalid UUID format:', uuid)
    return false
  }

  if (isDummyUUID(uuid)) {
    console.debug('UUID Validation: Dummy/test UUID detected:', uuid)
    return false
  }

  return true
}

/**
 * Get validation error message for debugging
 */
export function getUUIDValidationError(uuid: string): string | null {
  if (!uuid) return 'UUID is empty or null'
  if (typeof uuid !== 'string') return 'UUID must be a string'
  if (!isValidUUID(uuid)) return 'UUID format is invalid'
  if (isDummyUUID(uuid)) return 'UUID is a dummy/test value'
  return null
}