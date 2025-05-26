"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X, Smartphone } from "lucide-react"
import { usePWA } from "./pwa-provider"

export function InstallPrompt() {
  const { canInstall, isInstalled, installPrompt } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Show prompt after 3 seconds if app can be installed and hasn't been dismissed
    const timer = setTimeout(() => {
      if (canInstall && !isInstalled && !dismissed) {
        setShowPrompt(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [canInstall, isInstalled, dismissed])

  useEffect(() => {
    // Hide prompt if app gets installed
    if (isInstalled) {
      setShowPrompt(false)
    }
  }, [isInstalled])

  const handleInstall = async () => {
    try {
      await installPrompt()
      setShowPrompt(false)
    } catch (error) {
      console.error("Install failed:", error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    // Remember dismissal for this session
    sessionStorage.setItem("pwa-install-dismissed", "true")
  }

  // Check if user previously dismissed the prompt
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("pwa-install-dismissed")
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [])

  if (!showPrompt || !canInstall || isInstalled) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Install OpenBalti</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Install our app for a better experience with offline access and faster loading.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button onClick={handleInstall} className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Install App
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
