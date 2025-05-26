"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

interface PWAState {
  isOnline: boolean
  isInstalled: boolean
  canInstall: boolean
  isServiceWorkerReady: boolean
  deviceType: "ios" | "android" | "desktop"
  browserType: "chrome" | "safari" | "firefox" | "edge" | "other"
  installPromptEvent: any
  serviceWorkerVersion: string | null
  lastUpdateCheck: Date | null
}

interface PWAActions {
  triggerInstall: () => Promise<boolean>
  shareContent: (data: ShareData) => Promise<boolean>
  checkForUpdates: () => Promise<void>
  refreshApp: () => void
  dismissInstallPrompt: () => void
}

type PWAContextType = PWAState & PWAActions

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function usePWA() {
  const context = useContext(PWAContext)
  if (!context) {
    // Return safe defaults for SSR
    return {
      isOnline: true,
      isInstalled: false,
      canInstall: false,
      isServiceWorkerReady: false,
      deviceType: "desktop" as const,
      browserType: "other" as const,
      installPromptEvent: null,
      serviceWorkerVersion: null,
      lastUpdateCheck: null,
      triggerInstall: async () => false,
      shareContent: async () => false,
      checkForUpdates: async () => {},
      refreshApp: () => {},
      dismissInstallPrompt: () => {},
    }
  }
  return context
}

interface ComprehensivePWAManagerProps {
  children: ReactNode
}

export function ComprehensivePWAManager({ children }: ComprehensivePWAManagerProps) {
  const [state, setState] = useState<PWAState>({
    isOnline: true,
    isInstalled: false,
    canInstall: false,
    isServiceWorkerReady: false,
    deviceType: "desktop",
    browserType: "other",
    installPromptEvent: null,
    serviceWorkerVersion: null,
    lastUpdateCheck: null,
  })
  const [isClient, setIsClient] = useState(false)

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Device and browser detection
  const detectEnvironment = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      const userAgent = navigator.userAgent.toLowerCase()

      // Device detection
      let deviceType: PWAState["deviceType"] = "desktop"
      if (/iphone|ipad|ipod/.test(userAgent)) {
        deviceType = "ios"
      } else if (/android/.test(userAgent)) {
        deviceType = "android"
      }

      // Browser detection
      let browserType: PWAState["browserType"] = "other"
      if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) {
        browserType = "chrome"
      } else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
        browserType = "safari"
      } else if (/firefox/.test(userAgent)) {
        browserType = "firefox"
      } else if (/edg/.test(userAgent)) {
        browserType = "edge"
      }

      setState((prev) => ({ ...prev, deviceType, browserType }))

      console.log("[PWA] Environment detected:", { deviceType, browserType, userAgent })
    } catch (error) {
      console.error("[PWA] Environment detection failed:", error)
    }
  }, [])

  // Installation status detection
  const checkInstallationStatus = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://")

      setState((prev) => ({ ...prev, isInstalled: isStandalone }))

      console.log("[PWA] Installation status:", {
        standalone: window.matchMedia("(display-mode: standalone)").matches,
        navigatorStandalone: (window.navigator as any).standalone,
        referrer: document.referrer,
        isInstalled: isStandalone,
      })
    } catch (error) {
      console.error("[PWA] Installation check failed:", error)
    }
  }, [])

  // Service Worker management
  const registerServiceWorker = useCallback(async () => {
    if (!isClient || typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("[PWA] Service Worker not supported")
      return
    }

    try {
      console.log("[PWA] Registering Service Worker...")

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })

      console.log("[PWA] Service Worker registered:", registration)
      setState((prev) => ({ ...prev, isServiceWorkerReady: true }))

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("[PWA] SW message:", event.data)

        if (event.data?.type === "SW_ACTIVATED") {
          setState((prev) => ({
            ...prev,
            serviceWorkerVersion: event.data.version,
            lastUpdateCheck: new Date(),
          }))
        }
      })

      // Handle updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("[PWA] New Service Worker available")
              showUpdateNotification()
            }
          })
        }
      })

      // Get current version
      if (registration.active) {
        const messageChannel = new MessageChannel()
        messageChannel.port1.onmessage = (event) => {
          setState((prev) => ({
            ...prev,
            serviceWorkerVersion: event.data?.version || null,
          }))
        }
        registration.active.postMessage({ type: "GET_VERSION" }, [messageChannel.port2])
      }
    } catch (error) {
      console.error("[PWA] Service Worker registration failed:", error)
    }
  }, [isClient])

  // Install prompt management
  const setupInstallPrompt = useCallback(() => {
    if (!isClient || typeof window === "undefined") return

    const handleBeforeInstallPrompt = (e: any) => {
      console.log("[PWA] Install prompt available")
      e.preventDefault()
      setState((prev) => ({
        ...prev,
        installPromptEvent: e,
        canInstall: true,
      }))
    }

    const handleAppInstalled = () => {
      console.log("[PWA] App installed")
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        installPromptEvent: null,
      }))
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [isClient])

  // Network status monitoring
  const setupNetworkMonitoring = useCallback(() => {
    if (!isClient || typeof window === "undefined") return

    const handleOnline = () => {
      console.log("[PWA] Online")
      setState((prev) => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      console.log("[PWA] Offline")
      setState((prev) => ({ ...prev, isOnline: false }))
    }

    // Set initial status
    setState((prev) => ({ ...prev, isOnline: navigator.onLine }))

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [isClient])

  // Actions
  const triggerInstall = useCallback(async (): Promise<boolean> => {
    if (state.installPromptEvent) {
      try {
        console.log("[PWA] Triggering install prompt")
        await state.installPromptEvent.prompt()
        const { outcome } = await state.installPromptEvent.userChoice

        console.log("[PWA] Install prompt result:", outcome)

        if (outcome === "accepted") {
          setState((prev) => ({ ...prev, canInstall: false }))
          return true
        }
        return false
      } catch (error) {
        console.error("[PWA] Install prompt failed:", error)
        return false
      } finally {
        setState((prev) => ({ ...prev, installPromptEvent: null }))
      }
    } else if (state.deviceType === "ios") {
      // Show iOS instructions
      showIOSInstallInstructions()
      return false
    } else {
      // Show generic instructions
      showGenericInstallInstructions()
      return false
    }
  }, [state.installPromptEvent, state.deviceType])

  const shareContent = useCallback(async (data: ShareData): Promise<boolean> => {
    if (typeof navigator === "undefined") return false

    try {
      if (navigator.share && navigator.canShare?.(data)) {
        await navigator.share(data)
        return true
      } else if (data.url && navigator.clipboard) {
        await navigator.clipboard.writeText(data.url)
        return true
      }
      return false
    } catch (error) {
      console.error("[PWA] Share failed:", error)
      return false
    }
  }, [])

  const checkForUpdates = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        setState((prev) => ({ ...prev, lastUpdateCheck: new Date() }))
        console.log("[PWA] Update check completed")
      }
    } catch (error) {
      console.error("[PWA] Update check failed:", error)
    }
  }, [])

  const refreshApp = useCallback(() => {
    window.location.reload()
  }, [])

  const dismissInstallPrompt = useCallback(() => {
    setState((prev) => ({
      ...prev,
      canInstall: false,
      installPromptEvent: null,
    }))

    try {
      localStorage.setItem("pwa-install-dismissed", Date.now().toString())
    } catch (error) {
      console.error("[PWA] Failed to save dismissal:", error)
    }
  }, [])

  // Helper functions
  const showUpdateNotification = () => {
    if (typeof document === "undefined") return

    const notification = document.createElement("div")
    notification.className = "fixed top-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm"
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Update Available</div>
          <div class="text-sm opacity-90">Refresh to get the latest version</div>
        </div>
        <button onclick="window.location.reload()" class="ml-3 bg-white/20 px-3 py-1 rounded text-sm hover:bg-white/30">
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

  const showIOSInstallInstructions = () => {
    const message = `To install OpenBalti on iOS:

1. Tap the Share button (⬆️) at the bottom of Safari
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to confirm

The app will appear on your home screen!`

    alert(message)
  }

  const showGenericInstallInstructions = () => {
    const message = `To install OpenBalti:

• Chrome/Edge: Look for the install icon in the address bar
• Firefox: Use "Install" from the menu
• Safari: Use "Add to Home Screen" from the share menu

Once installed, the app will work offline!`

    alert(message)
  }

  // Initialize everything
  useEffect(() => {
    if (!isClient) return

    const cleanupFunctions: (() => void)[] = []

    const initialize = async () => {
      detectEnvironment()
      checkInstallationStatus()

      const networkCleanup = setupNetworkMonitoring()
      const installCleanup = setupInstallPrompt()

      if (networkCleanup) cleanupFunctions.push(networkCleanup)
      if (installCleanup) cleanupFunctions.push(installCleanup)

      await registerServiceWorker()
    }

    initialize()

    // Periodic checks
    const intervalId = setInterval(() => {
      checkInstallationStatus()
    }, 5000)

    return () => {
      clearInterval(intervalId)
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [
    isClient,
    detectEnvironment,
    checkInstallationStatus,
    setupNetworkMonitoring,
    setupInstallPrompt,
    registerServiceWorker,
  ])

  const value: PWAContextType = {
    ...state,
    triggerInstall,
    shareContent,
    checkForUpdates,
    refreshApp,
    dismissInstallPrompt,
  }

  if (!isClient) {
    return <>{children}</>
  }

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>
}
