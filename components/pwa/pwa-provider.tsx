"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { InstallPrompt } from "./install-prompt"
import { OfflineIndicator } from "./offline-indicator"

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    }
  }, [])

  if (!isClient) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <InstallPrompt />
      <OfflineIndicator />
    </>
  )
}
