"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Download, Smartphone } from "lucide-react"

interface DiagnosticResult {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: string
}

export function PWADiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null)
  const [deviceInfo, setDeviceInfo] = useState<any>({})

  const runDiagnostics = async () => {
    setIsRunning(true)
    const results: DiagnosticResult[] = []

    // 1. Check HTTPS
    results.push({
      name: "HTTPS Connection",
      status: location.protocol === "https:" ? "pass" : "fail",
      message: location.protocol === "https:" ? "Site is served over HTTPS" : "PWA requires HTTPS",
      details: `Protocol: ${location.protocol}`,
    })

    // 2. Check Service Worker Support
    const swSupported = "serviceWorker" in navigator
    results.push({
      name: "Service Worker Support",
      status: swSupported ? "pass" : "fail",
      message: swSupported ? "Service Worker API is supported" : "Service Worker not supported",
    })

    // 3. Check Service Worker Registration
    if (swSupported) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        results.push({
          name: "Service Worker Registration",
          status: registration ? "pass" : "fail",
          message: registration ? "Service Worker is registered" : "Service Worker not registered",
          details: registration ? `Scope: ${registration.scope}` : undefined,
        })

        if (registration) {
          results.push({
            name: "Service Worker State",
            status: registration.active ? "pass" : "warning",
            message: registration.active ? "Service Worker is active" : "Service Worker not active",
            details: `State: ${registration.active?.state || "none"}`,
          })
        }
      } catch (error) {
        results.push({
          name: "Service Worker Registration",
          status: "fail",
          message: "Failed to check Service Worker registration",
          details: String(error),
        })
      }
    }

    // 4. Check Manifest
    try {
      const manifestResponse = await fetch("/manifest.json")
      const manifest = await manifestResponse.json()
      results.push({
        name: "Web App Manifest",
        status: manifestResponse.ok ? "pass" : "fail",
        message: manifestResponse.ok ? "Manifest is accessible" : "Manifest not found",
        details: `Name: ${manifest.name}, Display: ${manifest.display}`,
      })

      // Check required manifest fields
      const requiredFields = ["name", "short_name", "start_url", "display", "icons"]
      const missingFields = requiredFields.filter((field) => !manifest[field])
      if (missingFields.length > 0) {
        results.push({
          name: "Manifest Validation",
          status: "fail",
          message: "Manifest missing required fields",
          details: `Missing: ${missingFields.join(", ")}`,
        })
      } else {
        results.push({
          name: "Manifest Validation",
          status: "pass",
          message: "All required manifest fields present",
        })
      }

      // Check icons
      if (manifest.icons && manifest.icons.length > 0) {
        const hasRequiredSizes = manifest.icons.some((icon: any) => icon.sizes.includes("192x192"))
        results.push({
          name: "Manifest Icons",
          status: hasRequiredSizes ? "pass" : "warning",
          message: hasRequiredSizes ? "Required icon sizes present" : "Missing 192x192 icon",
          details: `Icons: ${manifest.icons.length}`,
        })
      }
    } catch (error) {
      results.push({
        name: "Web App Manifest",
        status: "fail",
        message: "Failed to fetch or parse manifest",
        details: String(error),
      })
    }

    // 5. Check Device Type and User Agent
    const userAgent = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isAndroid = /Android/.test(userAgent)
    const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent)
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)

    setDeviceInfo({
      isIOS,
      isAndroid,
      isChrome,
      isSafari,
      userAgent,
    })

    results.push({
      name: "Device Detection",
      status: "pass",
      message: `Device: ${isIOS ? "iOS" : isAndroid ? "Android" : "Desktop"}`,
      details: `Browser: ${isChrome ? "Chrome" : isSafari ? "Safari" : "Other"}`,
    })

    // 6. Check Install Prompt Availability
    const hasInstallPrompt = installPromptEvent !== null
    results.push({
      name: "Install Prompt",
      status: hasInstallPrompt ? "pass" : isIOS ? "warning" : "fail",
      message: hasInstallPrompt
        ? "Install prompt is available"
        : isIOS
          ? "iOS uses manual installation"
          : "Install prompt not available",
      details: isIOS ? "iOS requires manual 'Add to Home Screen'" : undefined,
    })

    // 7. Check Standalone Mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://")

    results.push({
      name: "Standalone Mode",
      status: isStandalone ? "pass" : "warning",
      message: isStandalone ? "App is running in standalone mode" : "App is running in browser",
      details: `Display mode: ${isStandalone ? "standalone" : "browser"}`,
    })

    // 8. Check Network Status
    results.push({
      name: "Network Status",
      status: navigator.onLine ? "pass" : "warning",
      message: navigator.onLine ? "Device is online" : "Device is offline",
    })

    // 9. Check Local Storage
    try {
      localStorage.setItem("pwa-test", "test")
      localStorage.removeItem("pwa-test")
      results.push({
        name: "Local Storage",
        status: "pass",
        message: "Local Storage is available",
      })
    } catch (error) {
      results.push({
        name: "Local Storage",
        status: "fail",
        message: "Local Storage not available",
        details: String(error),
      })
    }

    // 10. Check Cache API
    const cacheSupported = "caches" in window
    results.push({
      name: "Cache API",
      status: cacheSupported ? "pass" : "fail",
      message: cacheSupported ? "Cache API is supported" : "Cache API not supported",
    })

    setDiagnostics(results)
    setIsRunning(false)
  }

  const triggerInstallPrompt = async () => {
    if (installPromptEvent) {
      try {
        await installPromptEvent.prompt()
        const { outcome } = await installPromptEvent.userChoice
        alert(`Install prompt result: ${outcome}`)
        if (outcome === "accepted") {
          setInstallPromptEvent(null)
        }
      } catch (error) {
        alert(`Install prompt failed: ${error}`)
      }
    } else if (deviceInfo.isIOS) {
      alert(`To install on iOS:
1. Tap the Share button (⬆️) at the bottom
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to confirm`)
    } else {
      alert("Install prompt not available. Try using browser menu to install.")
    }
  }

  useEffect(() => {
    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setInstallPromptEvent(e)
      console.log("Install prompt captured:", e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Auto-run diagnostics on mount
    runDiagnostics()

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "fail":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: "default",
      fail: "destructive",
      warning: "secondary",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            PWA Diagnostics & Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runDiagnostics} disabled={isRunning} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
              {isRunning ? "Running..." : "Run Diagnostics"}
            </Button>
            <Button onClick={triggerInstallPrompt} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Test Install
            </Button>
          </div>

          {deviceInfo.userAgent && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Device Information</h4>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Platform:</strong> {deviceInfo.isIOS ? "iOS" : deviceInfo.isAndroid ? "Android" : "Desktop"}
                </p>
                <p>
                  <strong>Browser:</strong> {deviceInfo.isChrome ? "Chrome" : deviceInfo.isSafari ? "Safari" : "Other"}
                </p>
                <p>
                  <strong>Install Prompt:</strong> {installPromptEvent ? "Available" : "Not Available"}
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-muted-foreground">User Agent</summary>
                  <p className="mt-1 text-xs break-all">{deviceInfo.userAgent}</p>
                </details>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {diagnostics.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{result.name}</h4>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  {result.details && <p className="text-xs text-muted-foreground mt-1 font-mono">{result.details}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
