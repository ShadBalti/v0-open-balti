"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after 3 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("User accepted the install prompt")
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDeferredPrompt(null)
  }

  if (!showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Install OpenBalti</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Install our app for a better experience with offline access
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              <Download className="h-4 w-4 mr-1" />
              Install
            </Button>
            <Button variant="outline" onClick={handleDismiss} size="sm">
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
