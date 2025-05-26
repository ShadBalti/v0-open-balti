const CACHE_VERSION = "v4.0.0"
const STATIC_CACHE = `openbalti-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `openbalti-dynamic-${CACHE_VERSION}`
const API_CACHE = `openbalti-api-${CACHE_VERSION}`

// Essential files for PWA functionality - these MUST be cached
const ESSENTIAL_FILES = ["/", "/manifest.json", "/favicon.ico", "/logo.png", "/android-chrome-512x512.png"]

// Install event - this is critical for PWA installability
self.addEventListener("install", (event) => {
  console.log(`[SW ${CACHE_VERSION}] Installing...`)

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE)

        // Cache essential files one by one to ensure success
        console.log("[SW] Caching essential files for PWA installability...")

        for (const file of ESSENTIAL_FILES) {
          try {
            console.log(`[SW] Caching: ${file}`)
            const response = await fetch(file, { cache: "no-cache" })

            if (response.ok) {
              await cache.put(file, response)
              console.log(`[SW] ✓ Successfully cached: ${file}`)
            } else {
              console.error(`[SW] ✗ Failed to cache ${file}: HTTP ${response.status}`)
              // For essential files, we need to ensure they're cached
              if (file === "/" || file === "/manifest.json") {
                throw new Error(`Critical file ${file} failed to cache`)
              }
            }
          } catch (error) {
            console.error(`[SW] ✗ Error caching ${file}:`, error)
            // Don't fail installation for non-critical files
            if (file === "/" || file === "/manifest.json") {
              throw error
            }
          }
        }

        // Initialize other caches
        await caches.open(DYNAMIC_CACHE)
        await caches.open(API_CACHE)

        console.log(`[SW ${CACHE_VERSION}] Installation complete - PWA ready for install`)

        // Skip waiting to activate immediately
        await self.skipWaiting()
      } catch (error) {
        console.error(`[SW] Installation failed:`, error)
        throw error // This will prevent SW from installing
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

        // Take control of all clients immediately
        await self.clients.claim()

        console.log(`[SW ${CACHE_VERSION}] Activation complete - PWA fully ready`)

        // Notify all clients that SW is ready
        const clients = await self.clients.matchAll()
        clients.forEach((client) => {
          client.postMessage({
            type: "SW_READY",
            version: CACHE_VERSION,
            timestamp: Date.now(),
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

  event.respondWith(handleRequest(request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  try {
    // Handle navigation requests (pages)
    if (request.mode === "navigate") {
      return await handleNavigationRequest(request)
    }

    // Handle API requests
    if (url.pathname.startsWith("/api/")) {
      return await handleApiRequest(request)
    }

    // Handle static assets
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

    // Return basic offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OpenBalti - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui; 
              text-align: center; 
              padding: 2rem; 
              background: #f8fafc;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .offline { color: #666; margin: 1rem 0; }
            button {
              background: #2563eb;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 6px;
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>OpenBalti Dictionary</h1>
            <p class="offline">You're currently offline. Please check your connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
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
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE)
      await cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Return cached API response if available
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
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

  if (event.data?.type === "FORCE_UPDATE") {
    // Force update by clearing caches and reloading
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      })
      .then(() => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => client.navigate(client.url))
        })
      })
  }
})

console.log(`[SW ${CACHE_VERSION}] Script loaded and ready`)
