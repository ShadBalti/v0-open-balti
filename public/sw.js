const CACHE_VERSION = "v3.0.0"
const STATIC_CACHE = `openbalti-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `openbalti-dynamic-${CACHE_VERSION}`
const API_CACHE = `openbalti-api-${CACHE_VERSION}`

// Essential files for PWA functionality
const ESSENTIAL_FILES = ["/", "/manifest.json", "/favicon.ico", "/logo.png", "/android-chrome-512x512.png"]

// Additional static assets
const STATIC_ASSETS = ["/baltistan.jpeg", "/developer.jpg"]

// API routes to cache
const API_ROUTES = ["/api/words", "/api/stats", "/api/activity"]

// Install event
self.addEventListener("install", (event) => {
  console.log(`[SW ${CACHE_VERSION}] Installing...`)

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE)

        // Cache essential files first
        console.log("[SW] Caching essential files...")
        for (const file of ESSENTIAL_FILES) {
          try {
            const response = await fetch(file)
            if (response.ok) {
              await cache.put(file, response)
              console.log(`[SW] ✓ Cached: ${file}`)
            } else {
              console.warn(`[SW] ✗ Failed to cache ${file}: ${response.status}`)
            }
          } catch (error) {
            console.warn(`[SW] ✗ Error caching ${file}:`, error)
          }
        }

        // Cache additional assets (non-critical)
        console.log("[SW] Caching additional assets...")
        for (const asset of STATIC_ASSETS) {
          try {
            const response = await fetch(asset)
            if (response.ok) {
              await cache.put(asset, response)
              console.log(`[SW] ✓ Cached: ${asset}`)
            }
          } catch (error) {
            console.warn(`[SW] Could not cache ${asset}:`, error)
          }
        }

        // Initialize other caches
        await caches.open(DYNAMIC_CACHE)
        await caches.open(API_CACHE)

        console.log(`[SW ${CACHE_VERSION}] Installation complete`)

        // Skip waiting to activate immediately
        await self.skipWaiting()
      } catch (error) {
        console.error(`[SW] Installation failed:`, error)
      }
    })(),
  )
})

// Activate event
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

        // Notify all clients
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

// Fetch event
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") return

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) return

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
    return await networkFirstStrategy(request)
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

    // Try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Try root page as fallback
    const rootResponse = await caches.match("/")
    if (rootResponse) {
      return rootResponse
    }

    // Return basic offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OpenBalti - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui; text-align: center; padding: 2rem; }
            .offline { color: #666; }
          </style>
        </head>
        <body>
          <h1>OpenBalti Dictionary</h1>
          <p class="offline">You're currently offline. Please check your connection and try again.</p>
          <button onclick="window.location.reload()">Retry</button>
        </body>
      </html>
    `,
      {
        status: 503,
        headers: { "Content-Type": "text/html" },
      },
    )
  }
}

async function handleApiRequest(request) {
  const url = new URL(request.url)

  // Check if this API should be cached
  const shouldCache = API_ROUTES.some((route) => url.pathname.startsWith(route))

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
    return new Response(
      JSON.stringify({
        error: "Network unavailable",
        offline: true,
        message: "This feature requires an internet connection",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    )
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

async function networkFirstStrategy(request) {
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
    return new Response("Offline", { status: 503 })
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
})

console.log(`[SW ${CACHE_VERSION}] Script loaded`)
