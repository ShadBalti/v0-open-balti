"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff, CheckCircle } from "lucide-react"
import { usePWA } from "./pwa-provider"

export function OfflineIndicator() {
  const { isOnline } = usePWA()
  const [showOffline, setShowOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true)
      setWasOffline(true)
      setShowReconnected(false)
    } else {
      setShowOffline(false)

      // Show reconnected message if we were previously offline
      if (wasOffline) {
        setShowReconnected(true)
        // Hide reconnected message after 3 seconds
        const timer = setTimeout(() => {
          setShowReconnected(false)
          setWasOffline(false)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [isOnline, wasOffline])

  if (!showOffline && !showReconnected) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      {showOffline && (
        <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're offline. Some features may be limited, but you can still browse cached content.
          </AlertDescription>
        </Alert>
      )}

      {showReconnected && (
        <Alert className="border-green-500/50 text-green-700 dark:border-green-500 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>You're back online! All features are now available.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
