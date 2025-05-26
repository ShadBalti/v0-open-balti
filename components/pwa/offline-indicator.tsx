"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineAlert, setShowOfflineAlert] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineAlert(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineAlert(true)
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showOfflineAlert) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <Alert className="border-orange-200 bg-orange-50 text-orange-800">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          You're offline. Some features may be limited, but you can still browse cached content.
        </AlertDescription>
      </Alert>
    </div>
  )
}
