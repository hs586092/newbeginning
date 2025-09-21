// Service Worker for ParentWise Community Platform
// Implements caching strategies for performance optimization

const CACHE_NAME = 'parentwise-v1'
const STATIC_CACHE = 'parentwise-static-v1'
const RUNTIME_CACHE = 'parentwise-runtime-v1'

// Static resources to cache on install
const STATIC_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/og-baby.png'
]

// API routes to cache with different strategies
const API_CACHE_PATTERNS = [
  { pattern: /^\/api\/posts/, strategy: 'networkFirst', ttl: 5 * 60 * 1000 }, // 5 minutes
  { pattern: /^\/api\/comments/, strategy: 'networkFirst', ttl: 2 * 60 * 1000 }, // 2 minutes
  { pattern: /^\/api\/likes/, strategy: 'networkFirst', ttl: 1 * 60 * 1000 }, // 1 minute
  { pattern: /^\/api\/search/, strategy: 'networkFirst', ttl: 10 * 60 * 1000 }, // 10 minutes
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_RESOURCES))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && name !== STATIC_CACHE && name !== RUNTIME_CACHE)
            .map(name => caches.delete(name))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Handle API requests
  if (request.url.includes('/api/')) {
    event.respondWith(handleAPIRequest(request))
    return
  }

  // Handle static assets
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(handleStaticAsset(request))
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
})

// API request handler with network-first strategy
async function handleAPIRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE)

  try {
    // Try network first
    const response = await fetch(request)

    if (response.ok) {
      // Cache successful responses
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline response for failed API calls
    return new Response(JSON.stringify({
      error: '네트워크 연결을 확인해주세요',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Static asset handler with cache-first strategy
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const response = await fetch(request)

    if (response.ok) {
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    // Return placeholder for failed image requests
    if (request.destination === 'image') {
      return new Response(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">이미지를 불러올 수 없습니다</text>
      </svg>`, {
        headers: { 'Content-Type': 'image/svg+xml' }
      })
    }

    throw error
  }
}

// Navigation handler with network-first, cache fallback
async function handleNavigation(request) {
  try {
    const response = await fetch(request)
    return response
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE)
    const offlinePage = await cache.match('/offline.html')
    return offlinePage || new Response('오프라인 상태입니다', { status: 503 })
  }
}

// Background sync for failed API requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  // Handle queued requests when connectivity is restored
  console.log('Background sync triggered - handling queued requests')
}