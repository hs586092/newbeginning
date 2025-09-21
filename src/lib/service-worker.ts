/**
 * Service Worker 등록 및 관리
 * 클라이언트 사이드 캐싱과 오프라인 지원
 */

export interface ServiceWorkerConfig {
  enabled: boolean
  swPath: string
  skipWaiting: boolean
  debug: boolean
}

const defaultConfig: ServiceWorkerConfig = {
  enabled: process.env.NODE_ENV === 'production',
  swPath: '/sw.js',
  skipWaiting: true,
  debug: process.env.NODE_ENV === 'development'
}

class ServiceWorkerManager {
  private config: ServiceWorkerConfig
  private registration: ServiceWorkerRegistration | null = null

  constructor(config: Partial<ServiceWorkerConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  async register(): Promise<boolean> {
    if (!this.isSupported() || !this.config.enabled) {
      if (this.config.debug) {
        console.log('🔧 Service Worker not supported or disabled')
      }
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register(this.config.swPath, {
        scope: '/'
      })

      this.setupEventListeners()

      if (this.config.debug) {
        console.log('✅ Service Worker registered successfully')
      }

      return true
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
      return false
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false

    try {
      await this.registration.unregister()
      this.registration = null

      if (this.config.debug) {
        console.log('🗑️ Service Worker unregistered')
      }

      return true
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error)
      return false
    }
  }

  async update(): Promise<boolean> {
    if (!this.registration) return false

    try {
      await this.registration.update()

      if (this.config.debug) {
        console.log('🔄 Service Worker updated')
      }

      return true
    } catch (error) {
      console.error('❌ Service Worker update failed:', error)
      return false
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator
  }

  private setupEventListeners(): void {
    if (!this.registration) return

    // Handle service worker updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            if (this.config.debug) {
              console.log('🆕 New Service Worker available')
            }

            // Notify user about update
            this.notifyUpdate()
          }
        })
      }
    })

    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, payload } = event.data

      switch (type) {
        case 'CACHE_UPDATED':
          if (this.config.debug) {
            console.log('💾 Cache updated:', payload)
          }
          break

        case 'OFFLINE_FALLBACK':
          if (this.config.debug) {
            console.log('📴 Using offline fallback:', payload)
          }
          break

        default:
          if (this.config.debug) {
            console.log('📨 SW Message:', event.data)
          }
      }
    })

    // Handle connection status changes
    window.addEventListener('online', () => {
      if (this.config.debug) {
        console.log('🌐 Connection restored')
      }
      this.syncData()
    })

    window.addEventListener('offline', () => {
      if (this.config.debug) {
        console.log('📴 Connection lost')
      }
    })
  }

  private notifyUpdate(): void {
    // Simple notification - can be enhanced with toast/modal
    if (confirm('새 버전이 있습니다. 지금 업데이트하시겠습니까?')) {
      if (this.config.skipWaiting) {
        this.registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      }
    }
  }

  private async syncData(): Promise<void> {
    if (!this.registration) return

    try {
      // Trigger background sync for failed requests
      await this.registration.sync.register('background-sync')

      if (this.config.debug) {
        console.log('🔄 Background sync registered')
      }
    } catch (error) {
      console.error('❌ Background sync failed:', error)
    }
  }
}

// Singleton instance
let swManager: ServiceWorkerManager | null = null

export function initializeServiceWorker(config?: Partial<ServiceWorkerConfig>): ServiceWorkerManager {
  if (!swManager) {
    swManager = new ServiceWorkerManager(config)
  }
  return swManager
}

export function getServiceWorkerManager(): ServiceWorkerManager | null {
  return swManager
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Wait for page load to avoid blocking critical resources
  window.addEventListener('load', () => {
    const manager = initializeServiceWorker()
    manager.register()
  })
}