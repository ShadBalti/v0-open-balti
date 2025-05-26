"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { InstallPrompt } from "./install-prompt"
import { OfflineIndicator } from "./offline-indicator"

interface PWAContextType {
  isOnline: boolean
  isInstalled: boolean
  canInstall: boolean
  isServiceWorkerReady: boolean
  installPrompt: () => Promise<void>
  updateServiceWorker: () => void
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function usePWA() {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider")
  }
  return context
}

interface PWAProviderProps {
  children: ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    let mounted = true

    const initializePWA = async () => {
      // Check installation status
      checkInstallationStatus()

      // Set initial online status
      setIsOnline(navigator.onLine)

      // Register service worker
      await registerServiceWorker()

      // Setup event listeners
      setupEventListeners()
    }

    const checkInstallationStatus = () => {
      if (typeof window === "undefined") return

      // Check for standalone mode (installed PWA)
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      const isInstalled = isStandalone || isInWebAppiOS

      console.log("[PWA] Installation status:", { isStandalone, isInWebAppiOS, isInstalled })
      setIsInstalled(isInstalled)
    }

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

        console.log("[PWA] Service worker registered:", registration)
        setSwRegistration(registration)
        setIsServiceWorkerReady(true)

        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (newWorker) {
            console.log("[PWA] New service worker found")
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[PWA] New content available")
                // Optionally show update notification
                if (confirm("New version available! Refresh to update?")) {
                  window.location.reload()
                }
              }
            })
          }
        })

        // Check for existing service worker
        if (registration.active) {
          setIsServiceWorkerReady(true)
        }
      } catch (error) {
        console.error("[PWA] Service worker registration failed:", error)
      }
    }

    const setupEventListeners = () => {
      // Online/offline detection
      const handleOnline = () => {
        console.log("[PWA] Online")
        setIsOnline(true)
      }

      const handleOffline = () => {
        console.log("[PWA] Offline")
        setIsOnline(false)
      }

      // Install prompt handling
      const handleBeforeInstallPrompt = (e: Event) => {
        console.log("[PWA] Install prompt available")
        e.preventDefault()
        setDeferredPrompt(e)
        setCanInstall(true)
      }

      const handleAppInstalled = () => {
        console.log("[PWA] App installed")
        setIsInstalled(true)
        setCanInstall(false)
        setDeferredPrompt(null)
      }

      // Service worker controller change
      const handleControllerChange = () => {
        console.log("[PWA] Service worker controller changed")
        if (!navigator.serviceWorker.controller) return

        // Reload to get new content
        window.location.reload()
      }

      // Add event listeners
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.addEventListener("appinstalled", handleAppInstalled)
      navigator.serviceWorker?.addEventListener("controllerchange", handleControllerChange)

      // Cleanup function
      return () => {
        if (!mounted) return
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.removeEventListener("appinstalled", handleAppInstalled)
        navigator.serviceWorker?.removeEventListener("controllerchange", handleControllerChange)
      }
    }

    initializePWA()

    return () => {
      mounted = false
    }
  }, [isClient])

  const installPrompt = async () => {
    if (!deferredPrompt) {
      console.warn("[PWA] No install prompt available")
      return
    }

    try {
      console.log("[PWA] Showing install prompt")
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      console.log("[PWA] Install prompt result:", outcome)

      if (outcome === "accepted") {
        setCanInstall(false)
        // Installation will be detected by appinstalled event
      }

      setDeferredPrompt(null)
    } catch (error) {
      console.error("[PWA] Install prompt failed:", error)
    }
  }

  const updateServiceWorker = () => {
    if (swRegistration) {
      swRegistration.update()
    }
  }

  const value: PWAContextType = {
    isOnline,
    isInstalled,
    canInstall,
    isServiceWorkerReady,
    installPrompt,
    updateServiceWorker,
  }

  if (!isClient) {
    return <>{children}</>
  }

  return (
    <PWAContext.Provider value={value}>
      {children}
      <InstallPrompt />
      <OfflineIndicator />
    </PWAContext.Provider>
  )
}
