const CACHE_NAME = "openbalti-v1.0.1"
const STATIC_CACHE = "openbalti-static-v1.0.1"
const DYNAMIC_CACHE = "openbalti-dynamic-v1.0.1"
const API_CACHE = "openbalti-api-v1.0.1"

// Critical assets that must be cached
const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo.png",
  "/android-chrome-512x512.png",
  "/baltistan.jpeg",
]

// API endpoints to cache
const API_ENDPOINTS = [
  "/api/words",
  "/api/words/dialects",
  "/api/words/difficulties",
  "/api/stats/community",
  "/api/activity",
]

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches
        .open(STATIC_CACHE)
        .then((cache) => {
          console.log("[SW] Caching static assets")
          return cache.addAll(STATIC_ASSETS).catch((error) => {
            console.error("[SW] Failed to cache static assets:", error)
            // Cache assets individually to avoid failing on one bad asset
            return Promise.allSettled(STATIC_ASSETS.map((asset) => cache.add(asset)))
          })
        }),

      // Initialize other caches
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE),
    ])
      .then(() => {
        console.log("[SW] Installation complete")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Installation failed:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches
        .keys()
        .then((cacheNames) => {
          const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE]
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (!validCaches.includes(cacheName)) {
                console.log("[SW] Deleting old cache:", cacheName)
                return caches.delete(cacheName)
              }
            }),
          )
        }),

      // Take control of all clients
      self.clients.claim(),
    ])
      .then(() => {
        console.log("[SW] Activation complete")
      })
      .catch((error) => {
        console.error("[SW] Activation failed:", error)
      }),
  )
})

// Fetch event - handle all network requests
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return
  }

  // Skip requests with cache-control: no-cache
  if (request.headers.get("cache-control") === "no-cache") {
    return
  }

  event.respondWith(handleFetch(request))
})

async function handleFetch(request) {
  const url = new URL(request.url)

  try {
    // Handle navigation requests (HTML pages)
    if (request.mode === "navigate") {
      return await handleNavigationRequest(request)
    }

    // Handle API requests
    if (url.pathname.startsWith("/api/")) {
      return await handleApiRequest(request)
    }

    // Handle static assets (images, CSS, JS)
    if (isStaticAsset(request)) {
      return await handleStaticAsset(request)
    }

    // Default: network first, then cache
    return await networkFirst(request, DYNAMIC_CACHE)
  } catch (error) {
    console.error("[SW] Fetch error:", error)

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const offlinePage = await caches.match("/offline.html")
      return offlinePage || new Response("Offline", { status: 503 })
    }

    // Return cached version if available
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return generic offline response
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    })
  }
}

// Handle navigation requests (pages)
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }

    throw new Error("Network response not ok")
  } catch (error) {
    console.log("[SW] Navigation request failed, serving from cache")

    // Try to serve from cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Serve offline page
    const offlinePage = await caches.match("/offline.html")
    return offlinePage || caches.match("/")
  }
}

// Handle API requests
async function handleApiRequest(request) {
  const url = new URL(request.url)

  // Check if this is a cacheable API endpoint
  const isCacheable = API_ENDPOINTS.some((endpoint) => url.pathname.startsWith(endpoint))

  if (!isCacheable) {
    // Non-cacheable API request - network only
    return fetch(request)
  }

  try {
    // Try network first
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }

    throw new Error("API response not ok")
  } catch (error) {
    console.log("[SW] API request failed, serving from cache")

    // Serve from cache if available
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return error response
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Handle static assets
async function handleStaticAsset(request) {
  // Cache first strategy for static assets
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache static assets
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }

    return networkResponse
  } catch (error) {
    console.error("[SW] Static asset fetch failed:", error)
    throw error
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
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

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url)
  const staticExtensions = [".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2"]

  return (
    staticExtensions.some((ext) => url.pathname.endsWith(ext)) ||
    request.destination === "image" ||
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font"
  )
}

// Background sync
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(handleBackgroundSync())
  }
})

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  const options = {
    body: event.data ? event.data.text() : "New content available!",
    icon: "/logo.png",
    badge: "/logo.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Explore",
        icon: "/logo.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/logo.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("OpenBalti", options))
})

// Notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked")
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  }
})

// Message handling
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// Background sync handler
async function handleBackgroundSync() {
  try {
    console.log("[SW] Handling background sync")
    // Add your background sync logic here
    // For example: sync offline form submissions, update cache, etc.
  } catch (error) {
    console.error("[SW] Background sync failed:", error)
  }
}

// Error handling
self.addEventListener("error", (event) => {
  console.error("[SW] Service worker error:", event.error)
})

self.addEventListener("unhandledrejection", (event) => {
  console.error("[SW] Unhandled promise rejection:", event.reason)
})

console.log("[SW] Service worker script loaded")
