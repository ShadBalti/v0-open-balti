const CACHE_VERSION = "v2.0.0"
const STATIC_CACHE = `openbalti-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `openbalti-dynamic-${CACHE_VERSION}`
const API_CACHE = `openbalti-api-${CACHE_VERSION}`

// Essential files that must be cached for offline functionality
const ESSENTIAL_FILES = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo.png",
  "/android-chrome-512x512.png",
]

// Additional files to cache for better performance
const STATIC_FILES = ["/baltistan.jpeg", "/developer.jpg"]

// API endpoints to cache
const CACHEABLE_APIS = ["/api/words", "/api/stats", "/api/activity"]

// Install event - cache essential files
self.addEventListener("install", (event) => {
  console.log(`[SW ${CACHE_VERSION}] Installing...`)

  event.waitUntil(
    (async () => {
      try {
        // Cache essential files first
        const staticCache = await caches.open(STATIC_CACHE)

        // Cache files individually to avoid failing on one bad file
        const cachePromises = ESSENTIAL_FILES.map(async (file) => {
          try {
            const response = await fetch(file)
            if (response.ok) {
              await staticCache.put(file, response)
              console.log(`[SW] Cached: ${file}`)
            } else {
              console.warn(`[SW] Failed to cache ${file}: ${response.status}`)
            }
          } catch (error) {
            console.warn(`[SW] Error caching ${file}:`, error)
          }
        })

        await Promise.allSettled(cachePromises)

        // Cache additional static files (non-critical)
        const additionalPromises = STATIC_FILES.map(async (file) => {
          try {
            const response = await fetch(file)
            if (response.ok) {
              await staticCache.put(file, response)
            }
          } catch (error) {
            console.warn(`[SW] Could not cache ${file}:`, error)
          }
        })

        await Promise.allSettled(additionalPromises)

        // Initialize other caches
        await caches.open(DYNAMIC_CACHE)
        await caches.open(API_CACHE)

        console.log(`[SW ${CACHE_VERSION}] Installation complete`)

        // Force activation
        await self.skipWaiting()
      } catch (error) {
        console.error(`[SW] Installation failed:`, error)
      }
    })(),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log(`[SW ${CACHE_VERSION}] Activating...`)

  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys()
        const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE]

        const deletePromises = cacheNames
          .filter((cacheName) => !validCaches.includes(cacheName))
          .map((cacheName) => {
            console.log(`[SW] Deleting old cache: ${cacheName}`)
            return caches.delete(cacheName)
          })

        await Promise.all(deletePromises)

        // Take control of all clients
        await self.clients.claim()

        console.log(`[SW ${CACHE_VERSION}] Activation complete`)

        // Notify clients about the new service worker
        const clients = await self.clients.matchAll()
        clients.forEach((client) => {
          client.postMessage({
            type: "SW_ACTIVATED",
            version: CACHE_VERSION,
          })
        })
      } catch (error) {
        console.error(`[SW] Activation failed:`, error)
      }
    })(),
  )
})

// Fetch event - handle all requests
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") return

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) return

  // Skip requests with no-cache header
  if (request.headers.get("cache-control") === "no-cache") return

  event.respondWith(handleRequest(request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  try {
    // Handle different types of requests
    if (request.mode === "navigate") {
      return await handleNavigationRequest(request)
    }

    if (url.pathname.startsWith("/api/")) {
      return await handleApiRequest(request)
    }

    if (isStaticAsset(request)) {
      return await handleStaticAsset(request)
    }

    // Default: network first with cache fallback
    return await networkFirstWithFallback(request)
  } catch (error) {
    console.error("[SW] Request handling error:", error)
    return await handleOfflineResponse(request)
  }
}

async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful navigation responses
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put(request, networkResponse.clone())
      return networkResponse
    }

    throw new Error(`Network response not ok: ${networkResponse.status}`)
  } catch (error) {
    console.log("[SW] Navigation request failed, trying cache...")

    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Try root page as fallback
    const rootResponse = await caches.match("/")
    if (rootResponse) {
      return rootResponse
    }

    // Last resort: offline page
    const offlineResponse = await caches.match("/offline.html")
    return offlineResponse || new Response("Offline", { status: 503 })
  }
}

async function handleApiRequest(request) {
  const url = new URL(request.url)

  // Check if this API should be cached
  const shouldCache = CACHEABLE_APIS.some((api) => url.pathname.startsWith(api))

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok && shouldCache) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE)
      await cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    if (shouldCache) {
      // Return cached API response if available
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }

    // Return error response
    return new Response(JSON.stringify({ error: "Network unavailable", offline: true }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  }
}

async function handleStaticAsset(request) {
  // Cache first for static assets
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache static assets
      const cache = await caches.open(STATIC_CACHE)
      await cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error("[SW] Static asset fetch failed:", error)
    throw error
  }
}

async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

async function handleOfflineResponse(request) {
  if (request.mode === "navigate") {
    const offlinePage = await caches.match("/offline.html")
    return offlinePage || new Response("Offline", { status: 503 })
  }

  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  return new Response("Offline", { status: 503 })
}

function isStaticAsset(request) {
  const url = new URL(request.url)
  const staticExtensions = [".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf"]

  return (
    staticExtensions.some((ext) => url.pathname.endsWith(ext)) ||
    request.destination === "image" ||
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font"
  )
}

// Message handling
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data)

  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data?.type === "GET_VERSION") {
    event.ports[0]?.postMessage({ version: CACHE_VERSION })
  }

  if (event.data?.type === "CACHE_URLS") {
    event.waitUntil(cacheUrls(event.data.urls))
  }
})

async function cacheUrls(urls) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    await Promise.allSettled(
      urls.map(async (url) => {
        try {
          const response = await fetch(url)
          if (response.ok) {
            await cache.put(url, response)
          }
        } catch (error) {
          console.warn(`[SW] Failed to cache ${url}:`, error)
        }
      }),
    )
  } catch (error) {
    console.error("[SW] Cache URLs failed:", error)
  }
}

// Background sync
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  try {
    console.log("[SW] Handling background sync")
    // Add your background sync logic here
  } catch (error) {
    console.error("[SW] Background sync failed:", error)
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  const options = {
    body: event.data ? event.data.text() : "New content available!",
    icon: "/logo.png",
    badge: "/logo.png",
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: 1 },
    actions: [
      { action: "explore", title: "Explore", icon: "/logo.png" },
      { action: "close", title: "Close", icon: "/logo.png" },
    ],
  }

  event.waitUntil(self.registration.showNotification("OpenBalti", options))
})

// Notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked")
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(self.clients.openWindow("/"))
  }
})

console.log(`[SW ${CACHE_VERSION}] Script loaded`)
