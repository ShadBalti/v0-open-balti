"use client"

import { useEffect, useState } from "react"
import { usePWA } from "./enhanced-pwa-provider"
import { Card, CardContent } from "@/components/ui/card"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const { isOnline } = usePWA()
  const [showIndicator, setShowIndicator] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    if (!isOnline) {
      setShowIndicator(true)
    } else {
      // Show "back online" message briefly
      if (showIndicator) {
        const timer = setTimeout(() => {
          setShowIndicator(false)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [isClient, isOnline, showIndicator])

  // Don't render during SSR
  if (!isClient || !showIndicator) {
    return null
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80">
      <Card
        className={`border-2 ${isOnline ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-orange-500 bg-orange-50 dark:bg-orange-950"}`}
      >
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            {isOnline ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-orange-600" />}
            <div>
              <p
                className={`text-sm font-medium ${isOnline ? "text-green-800 dark:text-green-200" : "text-orange-800 dark:text-orange-200"}`}
              >
                {isOnline ? "Back Online" : "You're Offline"}
              </p>
              <p
                className={`text-xs ${isOnline ? "text-green-700 dark:text-green-300" : "text-orange-700 dark:text-orange-300"}`}
              >
                {isOnline ? "All features are available" : "Using cached content"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
