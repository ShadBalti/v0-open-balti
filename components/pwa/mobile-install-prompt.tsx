"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Download, Share, Smartphone, Zap } from "lucide-react"
import { usePWA } from "./enhanced-pwa-provider"

export function MobileInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [interactionCount, setInteractionCount] = useState(0)
  const { canInstall, isInstalled, deviceType, installPrompt, addToHomeScreen } = usePWA()

  useEffect(() => {
    // Don't show if already installed or dismissed permanently
    if (isInstalled || dismissed) return

    // Check if user has permanently dismissed
    const permanentlyDismissed = localStorage.getItem("pwa-install-permanently-dismissed") === "true"
    if (permanentlyDismissed) {
      setDismissed(true)
      return
    }

    // Track user interactions
    let interactions = 0
    const trackInteraction = () => {
      interactions++
      setInteractionCount(interactions)
    }

    // Add interaction listeners
    document.addEventListener("click", trackInteraction)
    document.addEventListener("scroll", trackInteraction)
    document.addEventListener("keydown", trackInteraction)

    // Show prompt based on device type and engagement
    const showTimer = setTimeout(() => {
      if (deviceType !== "desktop" && !isInstalled && interactions >= 2) {
        setShowPrompt(true)
      }
    }, 5000) // Wait 5 seconds and at least 2 interactions

    // Cleanup
    return () => {
      clearTimeout(showTimer)
      document.removeEventListener("click", trackInteraction)
      document.removeEventListener("scroll", trackInteraction)
      document.removeEventListener("keydown", trackInteraction)
    }
  }, [canInstall, isInstalled, dismissed, deviceType])

  const handleInstall = async () => {
    try {
      if (deviceType === "ios") {
        addToHomeScreen()
      } else if (canInstall) {
        const success = await installPrompt()
        if (success) {
          setShowPrompt(false)
        }
      } else {
        addToHomeScreen()
      }
    } catch (error) {
      console.error("Install failed:", error)
      addToHomeScreen() // Fallback to instructions
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  const handlePermanentDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem("pwa-install-permanently-dismissed", "true")
  }

  if (!showPrompt || isInstalled || deviceType === "desktop") {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/20 to-transparent">
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-2xl border-0">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm">Install OpenBalti</h3>
                <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  <Zap className="w-3 h-3" />
                  <span>Fast & Offline</span>
                </div>
              </div>

              <p className="text-xs text-primary-foreground/90 mb-3 leading-relaxed">
                {deviceType === "ios"
                  ? "Add to your home screen for instant access and offline reading"
                  : "Install our app for faster loading, offline access, and a native experience"}
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  variant="secondary"
                  className="flex-1 gap-2 text-xs font-medium"
                >
                  {deviceType === "ios" ? (
                    <>
                      <Share className="w-3 h-3" />
                      Add to Home Screen
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      Install App
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="px-3 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <button
                onClick={handlePermanentDismiss}
                className="text-xs text-primary-foreground/60 hover:text-primary-foreground/80 mt-2 underline"
              >
                Don't show again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
