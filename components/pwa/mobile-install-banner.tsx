"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Download, Share } from "lucide-react"
import { useMobilePWA } from "./mobile-pwa-provider"

export function MobileInstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const { canInstall, isInstalled, deviceType, addToHomeScreen } = useMobilePWA()

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (isInstalled || dismissed) return

    // Check if user has dismissed the banner before
    const hasBeenDismissed = localStorage.getItem("pwa-install-banner-dismissed") === "true"
    if (hasBeenDismissed) {
      setDismissed(true)
      return
    }

    // Show banner after 3 seconds on mobile devices
    const timer = setTimeout(() => {
      if (deviceType !== "desktop" && !isInstalled) {
        setShowBanner(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [canInstall, isInstalled, dismissed, deviceType])

  const handleDismiss = () => {
    setShowBanner(false)
    setDismissed(true)
    localStorage.setItem("pwa-install-banner-dismissed", "true")
  }

  const handleInstall = () => {
    addToHomeScreen()
    setShowBanner(false)
  }

  if (!showBanner || isInstalled) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {deviceType === "ios" ? (
                <Share className="h-6 w-6 text-primary" />
              ) : (
                <Download className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Install OpenBalti</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {deviceType === "ios"
                  ? "Add to your home screen for a better experience"
                  : "Install our app for offline access and faster loading"}
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleInstall} className="text-xs">
                  {deviceType === "ios" ? "Show Instructions" : "Install"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleDismiss} className="text-xs">
                  Not Now
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="flex-shrink-0 h-6 w-6 p-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
