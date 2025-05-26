"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

interface PWAContextType {
  isOnline: boolean
  isInstalled: boolean
  canInstall: boolean
  isServiceWorkerReady: boolean
  deviceType: "ios" | "android" | "desktop"
  installPrompt: () => Promise<boolean>
  shareContent: (data: ShareData) => Promise<boolean>
  addToHomeScreen: () => void
  checkInstallability: () => void
  serviceWorkerVersion: string | null
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function usePWA() {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error("usePWA must be used within an EnhancedPWAProvider")
  }
  return context
}

interface EnhancedPWAProviderProps {
  children: ReactNode
}

export function EnhancedPWAProvider({ children }: EnhancedPWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false)
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">("desktop")
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [serviceWorkerVersion, setServiceWorkerVersion] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Device detection
  useEffect(() => {
    if (!isClient) return

    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setDeviceType("ios")
      } else if (/android/.test(userAgent)) {
        setDeviceType("android")
      } else {
        setDeviceType("desktop")
      }
    }

    detectDevice()
  }, [isClient])

  // Installation status detection
  const checkInstallationStatus = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      // Multiple ways to detect standalone mode
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://")

      console.log("[PWA] Installation check:", {
        standalone: window.matchMedia("(display-mode: standalone)").matches,
        navigatorStandalone: (window.navigator as any).standalone,
        referrer: document.referrer,
        isInstalled: isStandalone,
      })

      setIsInstalled(isStandalone)
    } catch (error) {
      console.error("[PWA] Installation check failed:", error)
    }
  }, [])

  // Service Worker registration
  useEffect(() => {
    if (!isClient) return

    const registerServiceWorker = async () => {
      if (!("serviceWorker" in navigator)) {
        console.warn("[PWA] Service workers not supported")
        return
      }

      try {
        console.log("[PWA] Registering service worker...")

        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })

        console.log("[PWA] Service worker registered successfully:", registration)
        setIsServiceWorkerReady(true)

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener("message", (event) => {
          console.log("[PWA] SW message:", event.data)

          if (event.data?.type === "SW_ACTIVATED") {
            setServiceWorkerVersion(event.data.version)
          }
        })

        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[PWA] New service worker installed")
                showUpdateNotification()
              }
            })
          }
        })

        // Check for existing service worker
        if (registration.active) {
          console.log("[PWA] Service worker already active")
          // Request version from active service worker
          const messageChannel = new MessageChannel()
          messageChannel.port1.onmessage = (event) => {
            setServiceWorkerVersion(event.data?.version || null)
          }
          registration.active.postMessage({ type: "GET_VERSION" }, [messageChannel.port2])
        }
      } catch (error) {
        console.error("[PWA] Service worker registration failed:", error)
      }
    }

    registerServiceWorker()
  }, [isClient])

  // Event listeners setup
  useEffect(() => {
    if (!isClient) return

    let mounted = true

    // Online/offline detection
    const handleOnline = () => {
      console.log("[PWA] Online")
      if (mounted) setIsOnline(true)
    }

    const handleOffline = () => {
      console.log("[PWA] Offline")
      if (mounted) setIsOnline(false)
    }

    // Install prompt handling
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("[PWA] Install prompt available")
      e.preventDefault()
      if (mounted) {
        setDeferredPrompt(e)
        setCanInstall(true)
      }
    }

    const handleAppInstalled = () => {
      console.log("[PWA] App installed successfully")
      if (mounted) {
        setIsInstalled(true)
        setCanInstall(false)
        setDeferredPrompt(null)
      }
    }

    // Visibility change handling
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkInstallationStatus()

        // Check for service worker updates
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: "CHECK_UPDATE" })
        }
      }
    }

    // Set initial online status
    setIsOnline(navigator.onLine)

    // Check installation status
    checkInstallationStatus()

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Cleanup
    return () => {
      mounted = false
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isClient, checkInstallationStatus])

  // Install prompt function
  const installPrompt = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn("[PWA] No install prompt available")
      return false
    }

    try {
      console.log("[PWA] Showing install prompt")

      // Show the prompt
      await deferredPrompt.prompt()

      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice
      console.log("[PWA] Install prompt result:", outcome)

      if (outcome === "accepted") {
        setCanInstall(false)
        // Don't set installed here, wait for appinstalled event
        return true
      }

      return false
    } catch (error) {
      console.error("[PWA] Install prompt failed:", error)
      return false
    } finally {
      setDeferredPrompt(null)
    }
  }, [deferredPrompt])

  // Share content function
  const shareContent = useCallback(async (data: ShareData): Promise<boolean> => {
    if (typeof navigator === "undefined") return false

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(data)) {
        await navigator.share(data)
        console.log("[PWA] Content shared successfully")
        return true
      } else if (data.url && navigator.clipboard) {
        await navigator.clipboard.writeText(data.url)
        console.log("[PWA] URL copied to clipboard")
        return true
      }
      return false
    } catch (error) {
      console.error("[PWA] Share failed:", error)

      // Fallback to clipboard
      if (data.url && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(data.url)
          return true
        } catch (clipboardError) {
          console.error("[PWA] Clipboard fallback failed:", clipboardError)
        }
      }
      return false
    }
  }, [])

  // Add to home screen function
  const addToHomeScreen = useCallback(() => {
    if (deviceType === "ios") {
      // Show iOS-specific instructions
      showIOSInstructions()
    } else if (canInstall && deferredPrompt) {
      installPrompt()
    } else {
      // Show generic instructions
      showGenericInstructions()
    }
  }, [deviceType, canInstall, deferredPrompt, installPrompt])

  // Check installability
  const checkInstallability = useCallback(() => {
    checkInstallationStatus()

    // Force check for install prompt
    if (deviceType === "android" && !isInstalled && !canInstall) {
      console.log("[PWA] Checking installability...")

      // Dispatch a custom event to potentially trigger beforeinstallprompt
      window.dispatchEvent(new Event("beforeinstallprompt"))
    }
  }, [checkInstallationStatus, deviceType, isInstalled, canInstall])

  // Helper functions
  const showUpdateNotification = () => {
    if (typeof document === "undefined") return

    const notification = document.createElement("div")
    notification.className = "fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg"
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">App updated! Refresh to get the latest version.</span>
        <button onclick="window.location.reload()" class="text-xs bg-white/20 px-3 py-1 rounded hover:bg-white/30">
          Refresh
        </button>
      </div>
    `
    document.body.appendChild(notification)

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 10000)
  }

  const showIOSInstructions = () => {
    const message = `To install OpenBalti on your iPhone/iPad:

1. Tap the Share button (⬆️) at the bottom of Safari
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to confirm

The app will appear on your home screen like a native app!`

    alert(message)
  }

  const showGenericInstructions = () => {
    const message = `To install OpenBalti:

• Chrome/Edge: Look for the install icon in the address bar
• Firefox: Use the "Install" option in the menu
• Safari: Use "Add to Home Screen" from the share menu

Once installed, the app will work offline and load faster!`

    alert(message)
  }

  const value: PWAContextType = {
    isOnline,
    isInstalled,
    canInstall,
    isServiceWorkerReady,
    deviceType,
    installPrompt,
    shareContent,
    addToHomeScreen,
    checkInstallability,
    serviceWorkerVersion,
  }

  if (!isClient) {
    return <>{children}</>
  }

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>
}
