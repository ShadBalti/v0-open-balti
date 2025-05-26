"use client"

import { useEffect, useState } from "react"
import { usePWA } from "./enhanced-pwa-provider"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Smartphone } from "lucide-react"

export function StandaloneDetector() {
  const { isInstalled, deviceType } = usePWA()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !isInstalled) return

    // Show confirmation when app is detected as installed
    setShowConfirmation(true)

    // Hide after 5 seconds
    const timer = setTimeout(() => {
      setShowConfirmation(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [isClient, isInstalled])

  // Don't render during SSR
  if (!isClient || !showConfirmation) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-sm text-green-800 dark:text-green-200">App Installed Successfully!</h3>
              <p className="text-xs text-green-700 dark:text-green-300">OpenBalti is now running in standalone mode</p>
            </div>
            <Smartphone className="h-5 w-5 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
