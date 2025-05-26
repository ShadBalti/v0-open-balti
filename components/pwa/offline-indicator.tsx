"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowOfflineMessage(true)
      } else if (showOfflineMessage) {
        // Show "back online" message briefly
        setTimeout(() => {
          setShowOfflineMessage(false)
        }, 3000)
      }
    }

    // Set initial status
    updateOnlineStatus()

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [showOfflineMessage])

  if (!showOfflineMessage) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Alert variant={isOnline ? "default" : "destructive"}>
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        <AlertDescription>
          {isOnline ? "You're back online!" : "You're offline. Some features may be limited."}
        </AlertDescription>
      </Alert>
    </div>
  )
}
