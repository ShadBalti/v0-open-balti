"use client"

import { useEffect, useState } from "react"
import { usePWA } from "./enhanced-pwa-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Download, Share } from "lucide-react"

export function MobileInstallPrompt() {
  const { canInstall, isInstalled, deviceType, installPrompt, addToHomeScreen } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || typeof window === "undefined") return

    // Check if user has dismissed the prompt
    try {
      const dismissed = localStorage.getItem("pwa-install-dismissed")
      if (dismissed) {
        setIsDismissed(true)
        return
      }
    } catch (error) {
      console.error("[PWA] Failed to check localStorage:", error)
    }

    // Show prompt after user engagement
    let engagementTimer: NodeJS.Timeout
    let hasEngaged = false

    const handleEngagement = () => {
      if (hasEngaged) return
      hasEngaged = true

      engagementTimer = setTimeout(() => {
        if (!isInstalled && !isDismissed && (canInstall || deviceType === "ios")) {
          setShowPrompt(true)
        }
      }, 5000) // Show after 5 seconds of engagement
    }

    // Listen for user engagement
    const events = ["click", "scroll", "keydown", "touchstart"]
    events.forEach((event) => {
      document.addEventListener(event, handleEngagement, { once: true, passive: true })
    })

    return () => {
      if (engagementTimer) {
        clearTimeout(engagementTimer)
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleEngagement)
      })
    }
  }, [isClient, canInstall, isInstalled, isDismissed, deviceType])

  const handleInstall = async () => {
    try {
      if (deviceType === "ios") {
        addToHomeScreen()
      } else {
        const success = await installPrompt()
        if (success) {
          setShowPrompt(false)
        }
      }
    } catch (error) {
      console.error("[PWA] Install failed:", error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setIsDismissed(true)
    try {
      localStorage.setItem("pwa-install-dismissed", "true")
    } catch (error) {
      console.error("[PWA] Failed to save dismissal:", error)
    }
  }

  // Don't render during SSR or if conditions aren't met
  if (!isClient || !showPrompt || isInstalled || isDismissed) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-2 border-blue-500 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-sm">Install OpenBalti</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {deviceType === "ios"
              ? "Add to your home screen for a better experience!"
              : "Install our app for faster access and offline use!"}
          </p>

          <div className="flex space-x-2">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              {deviceType === "ios" ? (
                <>
                  <Share className="h-4 w-4 mr-2" />
                  Add to Home Screen
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDismiss}>
              Later
            </Button>
          </div>

          {deviceType === "ios" && (
            <div className="mt-3 text-xs text-muted-foreground">
              Tap <Share className="h-3 w-3 inline mx-1" /> then "Add to Home Screen"
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
