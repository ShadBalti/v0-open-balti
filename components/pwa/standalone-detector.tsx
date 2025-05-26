"use client"

import { useEffect, useState } from "react"
import { usePWA } from "./enhanced-pwa-provider"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Smartphone } from "lucide-react"

export function StandaloneDetector() {
  const [showDetector, setShowDetector] = useState(false)
  const { isInstalled, deviceType } = usePWA()

  useEffect(() => {
    // Show detector for a few seconds when app is in standalone mode
    if (isInstalled) {
      setShowDetector(true)
      const timer = setTimeout(() => {
        setShowDetector(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isInstalled])

  if (!showDetector || !isInstalled) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="bg-green-600 text-white border-0 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">App Installed Successfully!</p>
              <p className="text-xs text-green-100">OpenBalti is now running in standalone mode</p>
            </div>
            <Smartphone className="w-5 h-5 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
