"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X, Smartphone, Share, Plus } from "lucide-react"
import { usePWA } from "./pwa-provider"

interface MobileInstallBannerProps {
  className?: string
}

export function MobileInstallBanner({ className }: MobileInstallBannerProps) {
  const { canInstall, isInstalled, installPrompt } = usePWA()
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    const isAndroidDevice = /android/.test(userAgent)
    const isMobileDevice = /mobi|android|iphone|ipad|ipod/.test(userAgent)

    setIsIOS(isIOSDevice)
    setIsAndroid(isAndroidDevice)
    setIsMobile(isMobileDevice)

    // Check if banner was previously dismissed
    const wasDismissed = localStorage.getItem("mobile-install-banner-dismissed")
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    // Show banner after 2 seconds on mobile if not installed
    if (isMobileDevice && !isInstalled) {
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isInstalled])

  const handleInstall = async () => {
    if (canInstall && installPrompt) {
      try {
        await installPrompt()
        setShowBanner(false)
      } catch (error) {
        console.error("Install failed:", error)
      }
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setDismissed(true)
    localStorage.setItem("mobile-install-banner-dismissed", "true")
  }

  const handleIOSInstall = () => {
    setShowBanner(false)
    // Show iOS install instructions
    alert(
      "To install OpenBalti:\n\n1. Tap the Share button (⬆️) at the bottom of Safari\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add' to confirm",
    )
  }

  if (!isMobile || isInstalled || dismissed || !showBanner) {
    return null
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${className}`}>
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Install OpenBalti App</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Get the full experience with offline access, faster loading, and native app features.
              </p>

              <div className="flex gap-2">
                {isIOS ? (
                  <Button onClick={handleIOSInstall} size="sm" className="flex-1 gap-2 text-xs">
                    <Share className="w-3 h-3" />
                    Add to Home Screen
                  </Button>
                ) : canInstall ? (
                  <Button onClick={handleInstall} size="sm" className="flex-1 gap-2 text-xs">
                    <Download className="w-3 h-3" />
                    Install App
                  </Button>
                ) : (
                  <Button onClick={handleIOSInstall} size="sm" className="flex-1 gap-2 text-xs">
                    <Plus className="w-3 h-3" />
                    Add to Home Screen
                  </Button>
                )}

                <Button variant="ghost" size="sm" onClick={handleDismiss} className="px-2">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
