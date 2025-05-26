"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Smartphone, Monitor } from "lucide-react"

export function EnhancedStandaloneDetector() {
  const [isStandalone, setIsStandalone] = useState(false)
  const [displayMode, setDisplayMode] = useState<string>("browser")
  const [isClient, setIsClient] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const checkStandaloneMode = () => {
      // Multiple methods to detect standalone mode
      const methods = {
        mediaQuery: window.matchMedia("(display-mode: standalone)").matches,
        navigatorStandalone: (window.navigator as any).standalone === true,
        androidApp: document.referrer.includes("android-app://"),
        windowControlsOverlay: window.matchMedia("(display-mode: window-controls-overlay)").matches,
        minimalUI: window.matchMedia("(display-mode: minimal-ui)").matches,
      }

      const standalone = methods.mediaQuery || methods.navigatorStandalone || methods.androidApp
      const mode = methods.mediaQuery
        ? "standalone"
        : methods.windowControlsOverlay
          ? "window-controls-overlay"
          : methods.minimalUI
            ? "minimal-ui"
            : "browser"

      console.log("[Standalone] Detection methods:", methods)
      console.log("[Standalone] Result:", { standalone, mode })

      setIsStandalone(standalone)
      setDisplayMode(mode)

      // Show notification when app becomes standalone
      if (standalone && !isStandalone) {
        setShowNotification(true)
        setTimeout(() => setShowNotification(false), 5000)
      }
    }

    // Initial check
    checkStandaloneMode()

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    const handleChange = () => {
      console.log("[Standalone] Display mode changed")
      checkStandaloneMode()
    }

    mediaQuery.addEventListener("change", handleChange)

    // Check periodically for changes
    const interval = setInterval(checkStandaloneMode, 3000)

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("[Standalone] App installed event")
      setTimeout(checkStandaloneMode, 1000)
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
      clearInterval(interval)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [isClient, isStandalone])

  if (!isClient) return null

  return (
    <>
      {/* Status indicator */}
      <div className="fixed top-4 right-4 z-40">
        <Badge variant={isStandalone ? "default" : "secondary"} className="flex items-center gap-1 text-xs">
          {isStandalone ? (
            <>
              <Smartphone className="w-3 h-3" />
              App Mode
            </>
          ) : (
            <>
              <Monitor className="w-3 h-3" />
              Browser
            </>
          )}
        </Badge>
      </div>

      {/* Success notification */}
      {showNotification && (
        <div className="fixed top-16 right-4 z-50 bg-green-600 text-white p-3 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <div>
              <div className="font-medium text-sm">App Installed!</div>
              <div className="text-xs opacity-90">OpenBalti is now running as an app</div>
            </div>
          </div>
        </div>
      )}

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-40 bg-black/80 text-white p-2 rounded text-xs font-mono">
          <div>Mode: {displayMode}</div>
          <div>Standalone: {isStandalone ? "Yes" : "No"}</div>
        </div>
      )}
    </>
  )
}
