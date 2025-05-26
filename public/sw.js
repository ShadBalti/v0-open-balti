const CACHE_NAME = "openbalti-v1"
const STATIC_CACHE_NAME = "openbalti-static-v1"
const DYNAMIC_CACHE_NAME = "openbalti-dynamic-v1"

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/logo.png",
  "/android-chrome-512x512.png",
  "/favicon.ico",
]

const API_CACHE_PATTERNS = [/^https:\/\/.*\/api\/words/, /^https:\/\/.*\/api\/stats/, /^https:\/\/.*\/api\/activity/]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      }),
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        return self.clients.claim()
      }),
  )
})

// Fetch event
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached version or offline page
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match("/offline.html")
          })
        }),
    )
    return
  }

  // Handle API requests
  if (API_CACHE_PATTERNS.some((pattern) => pattern.test(request.url))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request)
        }),
    )
    return
  }

  // Handle static assets
  if (request.destination === "image" || request.destination === "script" || request.destination === "style") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
      }),
    )
    return
  }

  // Default: try network first, then cache
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request)
    }),
  )
})

// Background sync
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle background sync tasks
      console.log("Background sync triggered"),
    )
  }
})

// Push notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: "/logo.png",
      badge: "/logo.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1,
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

    event.waitUntil(self.registration.showNotification(data.title || "OpenBalti", options))
  }
})

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  }
})
