"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Download, Share } from "lucide-react"

interface InstallPromptManagerProps {
  onInstallSuccess?: () => void
  onInstallDismiss?: () => void
}

export function InstallPromptManager({ onInstallSuccess, onInstallDismiss }: InstallPromptManagerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">("desktop")
  const [userEngagement, setUserEngagement] = useState(0)
  const [isClient, setIsClient] = useState(false)

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Detect device type
  useEffect(() => {
    if (!isClient) return

    const userAgent = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType("ios")
    } else if (/android/.test(userAgent)) {
      setDeviceType("android")
    } else {
      setDeviceType("desktop")
    }
  }, [isClient])

  // Check if already installed
  const checkInstallStatus = useCallback(() => {
    if (!isClient) return

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://")

    setIsInstalled(isStandalone)

    console.log("[Install] Status check:", {
      standalone: window.matchMedia("(display-mode: standalone)").matches,
      navigatorStandalone: (window.navigator as any).standalone,
      referrer: document.referrer,
      isInstalled: isStandalone,
    })
  }, [isClient])

  // Track user engagement
  const trackEngagement = useCallback(() => {
    setUserEngagement((prev) => prev + 1)
  }, [])

  // Setup install prompt listeners
  useEffect(() => {
    if (!isClient) return

    let engagementTimer: NodeJS.Timeout

    const handleBeforeInstallPrompt = (e: any) => {
      console.log("[Install] beforeinstallprompt event fired")
      e.preventDefault()
      setDeferredPrompt(e)

      // Show prompt after user engagement
      if (userEngagement >= 3) {
        setShowPrompt(true)
      }
    }

    const handleAppInstalled = () => {
      console.log("[Install] App installed successfully")
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      onInstallSuccess?.()
    }

    const handleUserEngagement = () => {
      trackEngagement()
    }

    // Listen for PWA events
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // Track user engagement
    document.addEventListener("click", handleUserEngagement)
    document.addEventListener("scroll", handleUserEngagement)
    document.addEventListener("keydown", handleUserEngagement)

    // Check install status periodically
    const statusInterval = setInterval(checkInstallStatus, 2000)

    // Show prompt after engagement threshold
    engagementTimer = setTimeout(() => {
      if (deferredPrompt && userEngagement >= 2) {
        setShowPrompt(true)
      }
    }, 5000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      document.removeEventListener("click", handleUserEngagement)
      document.removeEventListener("scroll", handleUserEngagement)
      document.removeEventListener("keydown", handleUserEngagement)
      clearInterval(statusInterval)
      clearTimeout(engagementTimer)
    }
  }, [isClient, deferredPrompt, userEngagement, trackEngagement, checkInstallStatus, onInstallSuccess])

  // Initial install status check
  useEffect(() => {
    if (isClient) {
      checkInstallStatus()
    }
  }, [isClient, checkInstallStatus])

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        console.log("[Install] Triggering install prompt")
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        console.log("[Install] User choice:", outcome)

        if (outcome === "accepted") {
          console.log("[Install] User accepted the install prompt")
          onInstallSuccess?.()
        } else {
          console.log("[Install] User dismissed the install prompt")
          onInstallDismiss?.()
        }

        setDeferredPrompt(null)
        setShowPrompt(false)
      } catch (error) {
        console.error("[Install] Install prompt failed:", error)
      }
    } else if (deviceType === "ios") {
      showIOSInstructions()
    } else {
      showGenericInstructions()
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDeferredPrompt(null)
    onInstallDismiss?.()

    // Remember dismissal
    try {
      localStorage.setItem("pwa-install-dismissed", Date.now().toString())
    } catch (error) {
      console.error("[Install] Failed to save dismissal:", error)
    }
  }

  const showIOSInstructions = () => {
    const instructions = `To install OpenBalti on your iPhone/iPad:

1. Tap the Share button (⬆️) at the bottom of Safari
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to confirm

The app will appear on your home screen and work offline!`

    alert(instructions)
  }

  const showGenericInstructions = () => {
    const instructions = `To install OpenBalti:

• Chrome/Edge: Look for the install icon (⬇️) in the address bar
• Firefox: Use "Install" from the browser menu
• Safari: Use "Add to Home Screen" from the share menu

Once installed, the app will work offline and feel like a native app!`

    alert(instructions)
  }

  // Don't render anything if not client-side or already installed
  if (!isClient || isInstalled) {
    return null
  }

  // Show different prompts based on device and availability
  if (showPrompt || (deviceType === "ios" && userEngagement >= 3)) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm shadow-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {deviceType === "ios" ? (
                <Share className="w-6 h-6 text-blue-600" />
              ) : (
                <Download className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm">Install OpenBalti</h3>
              <p className="text-xs text-gray-600 mt-1">
                {deviceType === "ios"
                  ? "Add to your home screen for quick access and offline use"
                  : "Get the app experience with offline access"}
              </p>
              <div className="flex gap-2 mt-3">
                <Button onClick={handleInstall} size="sm" className="flex-1 h-8 text-xs">
                  {deviceType === "ios" ? "Show How" : "Install"}
                </Button>
                <Button onClick={handleDismiss} variant="outline" size="sm" className="h-8 px-2">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
