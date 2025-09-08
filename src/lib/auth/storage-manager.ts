'use client'

import type { StorageCleanupResult } from '@/types/auth.types'

/**
 * Production-ready storage management for authentication
 * Handles all browser storage cleanup with comprehensive error handling
 */
export class AuthStorageManager {
  private readonly storagePrefix: string
  private readonly debugMode: boolean

  constructor(prefix = 'auth_', debugMode = false) {
    this.storagePrefix = prefix
    this.debugMode = debugMode
  }

  private log(message: string, data?: any) {
    if (this.debugMode) {
      console.log(`[AuthStorageManager] ${message}`, data || '')
    }
  }

  private logError(message: string, error: any) {
    if (this.debugMode) {
      console.error(`[AuthStorageManager] ${message}`, error)
    }
  }

  /**
   * Get all keys that match our storage prefix
   */
  private getAuthKeys(storage: Storage): string[] {
    const keys: string[] = []
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key?.startsWith(this.storagePrefix) || key?.includes('supabase')) {
        keys.push(key)
      }
    }
    return keys
  }

  /**
   * Clean localStorage completely
   */
  private cleanLocalStorage(): { success: boolean; error?: string } {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return { success: false, error: 'localStorage not available' }
      }

      const authKeys = this.getAuthKeys(localStorage)
      this.log('Cleaning localStorage keys:', authKeys)

      // Remove auth-specific keys
      authKeys.forEach(key => {
        localStorage.removeItem(key)
      })

      // Remove any remaining Supabase keys
      const allKeys = Object.keys(localStorage)
      allKeys.forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key)
        }
      })

      this.log('localStorage cleaned successfully')
      return { success: true }
    } catch (error) {
      this.logError('Failed to clean localStorage:', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * Clean sessionStorage completely
   */
  private cleanSessionStorage(): { success: boolean; error?: string } {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return { success: false, error: 'sessionStorage not available' }
      }

      const authKeys = this.getAuthKeys(sessionStorage)
      this.log('Cleaning sessionStorage keys:', authKeys)

      // Remove auth-specific keys
      authKeys.forEach(key => {
        sessionStorage.removeItem(key)
      })

      // Remove any remaining Supabase keys
      const allKeys = Object.keys(sessionStorage)
      allKeys.forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          sessionStorage.removeItem(key)
        }
      })

      this.log('sessionStorage cleaned successfully')
      return { success: true }
    } catch (error) {
      this.logError('Failed to clean sessionStorage:', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * Clean cookies (requires document access)
   */
  private cleanCookies(): { success: boolean; error?: string } {
    try {
      if (typeof document === 'undefined') {
        return { success: false, error: 'Document not available' }
      }

      const cookies = document.cookie.split(';')
      let cleanedCount = 0

      cookies.forEach(cookie => {
        const [name] = cookie.trim().split('=')
        
        // Remove auth-related cookies
        if (name.includes('supabase') || 
            name.includes('sb-') || 
            name.startsWith(this.storagePrefix) ||
            name.includes('auth') ||
            name.includes('session')) {
          
          // Clear cookie by setting expiry date in the past
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname};`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`
          cleanedCount++
        }
      })

      this.log(`Cleaned ${cleanedCount} cookies`)
      return { success: true }
    } catch (error) {
      this.logError('Failed to clean cookies:', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * Comprehensive storage cleanup
   * Returns detailed results for each storage type
   */
  async cleanupAllStorage(): Promise<StorageCleanupResult> {
    this.log('Starting comprehensive storage cleanup')

    const localStorage = this.cleanLocalStorage()
    const sessionStorage = this.cleanSessionStorage()
    const cookies = this.cleanCookies()

    const errors: string[] = []
    if (!localStorage.success && localStorage.error) {
      errors.push(`localStorage: ${localStorage.error}`)
    }
    if (!sessionStorage.success && sessionStorage.error) {
      errors.push(`sessionStorage: ${sessionStorage.error}`)
    }
    if (!cookies.success && cookies.error) {
      errors.push(`cookies: ${cookies.error}`)
    }

    // Always assume Supabase storage cleanup will happen via auth.signOut()
    const result: StorageCleanupResult = {
      localStorage: localStorage.success,
      sessionStorage: sessionStorage.success,
      cookies: cookies.success,
      supabaseStorage: true, // Will be handled by Supabase SDK
      errors
    }

    this.log('Storage cleanup completed:', result)
    return result
  }

  /**
   * Verify storage has been cleaned
   */
  verifyCleanup(): { clean: boolean; remainingItems: string[] } {
    const remainingItems: string[] = []

    try {
      // Check localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const allLocalKeys = Object.keys(localStorage)
        allLocalKeys.forEach(key => {
          if (key.includes('supabase') || key.includes('sb-') || key.startsWith(this.storagePrefix)) {
            remainingItems.push(`localStorage: ${key}`)
          }
        })
      }

      // Check sessionStorage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const allSessionKeys = Object.keys(sessionStorage)
        allSessionKeys.forEach(key => {
          if (key.includes('supabase') || key.includes('sb-') || key.startsWith(this.storagePrefix)) {
            remainingItems.push(`sessionStorage: ${key}`)
          }
        })
      }

      // Check cookies
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        cookies.forEach(cookie => {
          const [name] = cookie.trim().split('=')
          if (name.includes('supabase') || name.includes('sb-') || name.startsWith(this.storagePrefix)) {
            remainingItems.push(`cookie: ${name}`)
          }
        })
      }
    } catch (error) {
      this.logError('Error during cleanup verification:', error)
      remainingItems.push(`verification_error: ${error}`)
    }

    const clean = remainingItems.length === 0
    this.log(`Cleanup verification - Clean: ${clean}, Remaining: ${remainingItems.length}`)

    return { clean, remainingItems }
  }
}