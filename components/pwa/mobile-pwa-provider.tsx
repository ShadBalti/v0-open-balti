"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { MobileInstallBanner } from "./mobile-install-banner"
import { OfflineIndicator } from "./offline-indicator"

interface MobilePWAContextType {
  isOnline: boolean
  isInstalled: boolean
  canInstall: boolean
  isServiceWorkerReady: boolean
  deviceType: "ios" | "android" | "desktop"
  installPrompt: () => Promise<void>
  shareContent: (data: ShareData) => Promise<void>
  addToHomeScreen: () => void
}

const MobilePWAContext = createContext<MobilePWAContextType | undefined>(undefined)

export function useMobilePWA() {
  const context = useContext(MobilePWAContext)
  if (!context) {
    throw new Error("useMobilePWA must be used within a MobilePWAProvider")
  }
  return context
}

interface MobilePWAProviderProps {
  children: ReactNode
}

export function MobilePWAProvider({ children }: MobilePWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false)
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">("desktop")
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const initializeMobilePWA = async () => {
      // Detect device type
      detectDeviceType()

      // Check installation status
      checkInstallationStatus()

      // Set initial online status
      setIsOnline(navigator.onLine)

      // Register service worker with mobile optimizations
      await registerMobileServiceWorker()

      // Setup mobile-specific event listeners
      setupMobileEventListeners()

      // Setup viewport meta tag for mobile
      setupMobileViewport()

      // Setup mobile-specific features
      setupMobileFeatures()
    }

    const detectDeviceType = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setDeviceType("ios")
      } else if (/android/.test(userAgent)) {
        setDeviceType("android")
      } else {
        setDeviceType("desktop")
      }
    }

    const checkInstallationStatus = () => {
      if (typeof window === "undefined") return

      // Check for standalone mode (installed PWA)
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      const isInstalled = isStandalone || isInWebAppiOS

      console.log("[Mobile PWA] Installation status:", { isStandalone, isInWebAppiOS, isInstalled })
      setIsInstalled(isInstalled)
    }

    const registerMobileServiceWorker = async () => {
      if (!("serviceWorker" in navigator)) {
        console.warn("[Mobile PWA] Service workers not supported")
        return
      }

      try {
        console.log("[Mobile PWA] Registering service worker...")
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })

        console.log("[Mobile PWA] Service worker registered:", registration)
        setIsServiceWorkerReady(true)

        // Handle updates with mobile-friendly notifications
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // Show mobile-friendly update notification
                showMobileUpdateNotification()
              }
            })
          }
        })
      } catch (error) {
        console.error("[Mobile PWA] Service worker registration failed:", error)
      }
    }

    const setupMobileEventListeners = () => {
      // Online/offline detection
      const handleOnline = () => {
        console.log("[Mobile PWA] Online")
        setIsOnline(true)
      }

      const handleOffline = () => {
        console.log("[Mobile PWA] Offline")
        setIsOnline(false)
      }

      // Install prompt handling (Android)
      const handleBeforeInstallPrompt = (e: Event) => {
        console.log("[Mobile PWA] Install prompt available")
        e.preventDefault()
        setDeferredPrompt(e)
        setCanInstall(true)
      }

      const handleAppInstalled = () => {
        console.log("[Mobile PWA] App installed")
        setIsInstalled(true)
        setCanInstall(false)
        setDeferredPrompt(null)
      }

      // Mobile-specific events
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          // App became visible, check for updates
          if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: "CHECK_UPDATE" })
          }
        }
      }

      // Touch events for better mobile interaction
      const handleTouchStart = () => {
        // Prevent zoom on double tap for better app-like experience
        document.addEventListener("touchend", handleTouchEnd, { passive: true })
      }

      const handleTouchEnd = () => {
        document.removeEventListener("touchend", handleTouchEnd)
      }

      // Add event listeners
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.addEventListener("appinstalled", handleAppInstalled)
      document.addEventListener("visibilitychange", handleVisibilityChange)
      document.addEventListener("touchstart", handleTouchStart, { passive: true })

      // Cleanup function
      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.removeEventListener("appinstalled", handleAppInstalled)
        document.removeEventListener("visibilitychange", handleVisibilityChange)
        document.removeEventListener("touchstart", handleTouchStart)
      }
    }

    const setupMobileViewport = () => {
      // Ensure proper viewport meta tag for mobile
      let viewportMeta = document.querySelector('meta[name="viewport"]')
      if (!viewportMeta) {
        viewportMeta = document.createElement("meta")
        viewportMeta.setAttribute("name", "viewport")
        document.head.appendChild(viewportMeta)
      }

      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      )

      // Add mobile-specific meta tags
      const mobileMetaTags = [
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "apple-mobile-web-app-title", content: "OpenBalti" },
        { name: "format-detection", content: "telephone=no" },
        { name: "msapplication-tap-highlight", content: "no" },
      ]

      mobileMetaTags.forEach(({ name, content }) => {
        let meta = document.querySelector(`meta[name="${name}"]`)
        if (!meta) {
          meta = document.createElement("meta")
          meta.setAttribute("name", name)
          document.head.appendChild(meta)
        }
        meta.setAttribute("content", content)
      })
    }

    const setupMobileFeatures = () => {
      // Disable pull-to-refresh on mobile
      document.body.style.overscrollBehavior = "none"

      // Prevent zoom on input focus (iOS)
      const inputs = document.querySelectorAll("input, textarea, select")
      inputs.forEach((input) => {
        input.addEventListener("focus", () => {
          if (deviceType === "ios") {
            const viewport = document.querySelector('meta[name="viewport"]')
            if (viewport) {
              viewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no")
            }
          }
        })

        input.addEventListener("blur", () => {
          if (deviceType === "ios") {
            const viewport = document.querySelector('meta[name="viewport"]')
            if (viewport) {
              viewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no")
            }
          }
        })
      })
    }

    const showMobileUpdateNotification = () => {
      // Create a mobile-friendly update notification
      const notification = document.createElement("div")
      notification.className =
        "fixed top-4 left-4 right-4 z-50 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg"
      notification.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">New version available!</span>
          <button onclick="window.location.reload()" class="text-xs bg-white/20 px-2 py-1 rounded">
            Update
          </button>
        </div>
      `
      document.body.appendChild(notification)

      // Remove notification after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 5000)
    }

    initializeMobilePWA()
  }, [isClient, deviceType])

  const installPrompt = async () => {
    if (!deferredPrompt) {
      console.warn("[Mobile PWA] No install prompt available")
      return
    }

    try {
      console.log("[Mobile PWA] Showing install prompt")
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      console.log("[Mobile PWA] Install prompt result:", outcome)

      if (outcome === "accepted") {
        setCanInstall(false)
      }

      setDeferredPrompt(null)
    } catch (error) {
      console.error("[Mobile PWA] Install prompt failed:", error)
    }
  }

  const shareContent = async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data)
        console.log("[Mobile PWA] Content shared successfully")
      } catch (error) {
        console.error("[Mobile PWA] Share failed:", error)
        // Fallback to clipboard
        if (data.url && navigator.clipboard) {
          await navigator.clipboard.writeText(data.url)
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      if (data.url && navigator.clipboard) {
        await navigator.clipboard.writeText(data.url)
      }
    }
  }

  const addToHomeScreen = () => {
    if (deviceType === "ios") {
      // Show iOS-specific instructions
      alert(
        "To add OpenBalti to your home screen:\n\n1. Tap the Share button (⬆️) at the bottom\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add' to confirm",
      )
    } else if (canInstall) {
      installPrompt()
    }
  }

  const value: MobilePWAContextType = {
    isOnline,
    isInstalled,
    canInstall,
    isServiceWorkerReady,
    deviceType,
    installPrompt,
    shareContent,
    addToHomeScreen,
  }

  if (!isClient) {
    return <>{children}</>
  }

  return (
    <MobilePWAContext.Provider value={value}>
      {children}
      <MobileInstallBanner />
      <OfflineIndicator />
    </MobilePWAContext.Provider>
  )
}
