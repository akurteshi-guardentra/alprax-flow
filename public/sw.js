const CACHE_NAME = 'alprax-v1.0.0'
const STATIC_CACHE = 'alprax-static-v1.0.0'
const DYNAMIC_CACHE = 'alprax-dynamic-v1.0.0'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/payments',
  '/manifest.json',
  '/favicon.ico'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/exchange-rates/,
  /\/api\/user\/profile/,
  /\/api\/transactions\/recent/
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Static assets cached, skipping waiting')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('alprax-') && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE
            )
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('Service Worker activated, claiming clients')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle requests with cache strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request))
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request))
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigation(request))
  } else {
    event.respondWith(handleDynamicRequest(request))
  }
})

// Check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url)
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)
}

// Check if request is for API
function isAPIRequest(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/') || 
         url.pathname.startsWith('/functions/') ||
         API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))
}

// Check if request is navigation
function isNavigationRequest(request) {
  return request.mode === 'navigate'
}

// Handle static assets - Cache First strategy
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Static asset fetch failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

// Handle API requests - Network First with cache fallback
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('API request failed, trying cache:', request.url)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      // Add custom header to indicate cached response
      const response = cachedResponse.clone()
      response.headers.set('X-Cache-Status', 'cached')
      return response
    }
    
    // Return offline indicator for failed API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'No network connection and no cached data available'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Handle navigation - App Shell pattern
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    console.log('Navigation failed, serving app shell')
    
    // Try to serve cached index.html as app shell
    const cachedResponse = await caches.match('/')
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Alprax - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              text-align: center; 
              padding: 2rem;
              background: #0F172A;
              color: white;
            }
            .offline-message {
              max-width: 400px;
              margin: 0 auto;
              padding: 2rem;
              border: 1px solid #334155;
              border-radius: 8px;
              background: #1E293B;
            }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Handle other dynamic requests - Cache First with network fallback
async function handleDynamicRequest(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      // Update cache in background
      fetch(request).then(response => {
        if (response.ok) {
          const cache = caches.open(DYNAMIC_CACHE)
          cache.then(c => c.put(request, response))
        }
      }).catch(() => {})
      
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    return new Response('Offline', { status: 503 })
  }
}

// Background sync for failed transactions
self.addEventListener('sync', event => {
  if (event.tag === 'retry-transaction') {
    event.waitUntil(retryFailedTransactions())
  }
})

async function retryFailedTransactions() {
  // Implementation for retrying failed transactions when back online
  console.log('Retrying failed transactions...')
}

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: data.url,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close()

  if (event.action === 'view' && event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    )
  }
})