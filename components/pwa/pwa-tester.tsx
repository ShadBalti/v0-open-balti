"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Wifi, WifiOff, CheckCircle, XCircle, Smartphone, RefreshCw, Bell, Database } from "lucide-react"

interface PWACapabilities {
  serviceWorker: boolean
  installPrompt: boolean
  offline: boolean
  notifications: boolean
  standalone: boolean
  caching: boolean
}

export function PWATester() {
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    serviceWorker: false,
    installPrompt: false,
    offline: false,
    notifications: false,
    standalone: false,
    caching: false,
  })

  const [isOnline, setIsOnline] = useState(true)
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null)
  const [testResults, setTestResults] = useState<string[]>([])
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    checkPWACapabilities()
    setupEventListeners()
  }, [])

  const checkPWACapabilities = async () => {
    const newCapabilities: PWACapabilities = {
      serviceWorker: "serviceWorker" in navigator,
      installPrompt: false,
      offline: !navigator.onLine,
      notifications: "Notification" in window,
      standalone:
        window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true,
      caching: "caches" in window,
    }

    // Check if service worker is registered
    if (newCapabilities.serviceWorker) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        newCapabilities.serviceWorker = !!registration
      } catch (error) {
        console.error("Service worker check failed:", error)
      }
    }

    setCapabilities(newCapabilities)
    setIsInstalled(newCapabilities.standalone)
    setIsOnline(navigator.onLine)
  }

  const setupEventListeners = () => {
    // Install prompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPromptEvent(e)
      setCapabilities((prev) => ({ ...prev, installPrompt: true }))
      addTestResult("✅ Install prompt event detected")
    }

    // Online/offline listeners
    const handleOnline = () => {
      setIsOnline(true)
      addTestResult("🌐 Connection restored")
    }

    const handleOffline = () => {
      setIsOnline(false)
      addTestResult("📴 Connection lost - testing offline mode")
    }

    // App installed listener
    const handleAppInstalled = () => {
      setIsInstalled(true)
      addTestResult("📱 App successfully installed!")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }

  const addTestResult = (message: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testInstallPrompt = async () => {
    if (installPromptEvent) {
      try {
        await installPromptEvent.prompt()
        const { outcome } = await installPromptEvent.userChoice
        addTestResult(`📲 Install prompt result: ${outcome}`)

        if (outcome === "accepted") {
          setIsInstalled(true)
        }

        setInstallPromptEvent(null)
        setCapabilities((prev) => ({ ...prev, installPrompt: false }))
      } catch (error) {
        addTestResult(`❌ Install prompt failed: ${error}`)
      }
    } else {
      addTestResult("⚠️ No install prompt available (may already be installed or not supported)")
    }
  }

  const testServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          addTestResult("✅ Service Worker is registered and active")

          // Test service worker messaging
          if (registration.active) {
            registration.active.postMessage({ type: "TEST_MESSAGE" })
            addTestResult("📤 Test message sent to service worker")
          }
        } else {
          addTestResult("❌ Service Worker not found")
        }
      } catch (error) {
        addTestResult(`❌ Service Worker test failed: ${error}`)
      }
    } else {
      addTestResult("❌ Service Worker not supported")
    }
  }

  const testCaching = async () => {
    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys()
        addTestResult(`💾 Found ${cacheNames.length} cache(s): ${cacheNames.join(", ")}`)

        // Test cache functionality
        const cache = await caches.open("test-cache")
        const testUrl = "/test-cache-entry"
        const testResponse = new Response("Test cache data")

        await cache.put(testUrl, testResponse)
        const cachedResponse = await cache.match(testUrl)

        if (cachedResponse) {
          addTestResult("✅ Cache read/write test successful")
          await cache.delete(testUrl)
        } else {
          addTestResult("❌ Cache test failed")
        }
      } catch (error) {
        addTestResult(`❌ Cache test failed: ${error}`)
      }
    } else {
      addTestResult("❌ Cache API not supported")
    }
  }

  const testOfflineMode = async () => {
    addTestResult("🔄 Testing offline functionality...")

    try {
      // Test if cached resources are available
      const response = await fetch("/", { cache: "only-if-cached", mode: "same-origin" })
      if (response.ok) {
        addTestResult("✅ Homepage available from cache")
      }
    } catch (error) {
      addTestResult("⚠️ Homepage not cached or cache miss")
    }

    // Test API caching
    try {
      const apiResponse = await fetch("/api/words", { cache: "only-if-cached", mode: "same-origin" })
      if (apiResponse.ok) {
        addTestResult("✅ API data available from cache")
      }
    } catch (error) {
      addTestResult("⚠️ API data not cached")
    }
  }

  const testNotifications = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission()
        addTestResult(`🔔 Notification permission: ${permission}`)

        if (permission === "granted") {
          new Notification("PWA Test", {
            body: "Notifications are working!",
            icon: "/logo.png",
            badge: "/logo.png",
          })
          addTestResult("✅ Test notification sent")
        }
      } catch (error) {
        addTestResult(`❌ Notification test failed: ${error}`)
      }
    } else {
      addTestResult("❌ Notifications not supported")
    }
  }

  const simulateOffline = () => {
    addTestResult("🔄 Simulating offline mode...")
    // This will trigger the offline event listeners
    window.dispatchEvent(new Event("offline"))
  }

  const simulateOnline = () => {
    addTestResult("🔄 Simulating online mode...")
    // This will trigger the online event listeners
    window.dispatchEvent(new Event("online"))
  }

  const clearTestResults = () => {
    setTestResults([])
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "secondary"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            PWA Testing Dashboard
          </CardTitle>
          <CardDescription>Test and verify Progressive Web App functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PWA Status Overview */}
          <div>
            <h3 className="text-lg font-semibold mb-3">PWA Capabilities Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {getStatusBadge(capabilities.serviceWorker, "Service Worker")}
              {getStatusBadge(capabilities.installPrompt, "Install Prompt")}
              {getStatusBadge(capabilities.caching, "Caching")}
              {getStatusBadge(capabilities.notifications, "Notifications")}
              {getStatusBadge(capabilities.standalone, "Standalone Mode")}
              {getStatusBadge(isOnline, "Online Status")}
            </div>
          </div>

          <Separator />

          {/* Connection Status */}
          <Alert>
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <AlertDescription>
              {isOnline ? "You are currently online" : "You are currently offline"}
              {isInstalled && " • App is installed"}
            </AlertDescription>
          </Alert>

          {/* Test Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-3">PWA Tests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={testInstallPrompt}
                disabled={!capabilities.installPrompt || isInstalled}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Test Install Prompt
              </Button>

              <Button onClick={testServiceWorker} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Test Service Worker
              </Button>

              <Button onClick={testCaching} variant="outline" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Test Caching
              </Button>

              <Button onClick={testNotifications} variant="outline" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Test Notifications
              </Button>

              <Button onClick={testOfflineMode} variant="outline" className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                Test Offline Mode
              </Button>

              <Button onClick={checkPWACapabilities} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Button>
            </div>
          </div>

          <Separator />

          {/* Simulation Controls */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Simulation Controls</h3>
            <div className="flex gap-3">
              <Button onClick={simulateOffline} variant="destructive" size="sm" className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                Simulate Offline
              </Button>

              <Button onClick={simulateOnline} variant="default" size="sm" className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Simulate Online
              </Button>
            </div>
          </div>

          <Separator />

          {/* Test Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <Button onClick={clearTestResults} variant="outline" size="sm">
                Clear Results
              </Button>
            </div>

            <div className="bg-muted rounded-lg p-4 max-h-60 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-muted-foreground text-sm">No test results yet. Run some tests above!</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Desktop (Chrome/Edge):</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Look for the install icon in the address bar</li>
              <li>Click "Install OpenBalti" when prompted</li>
              <li>Or use the three-dot menu → "Install OpenBalti"</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Mobile (Android):</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Tap the three-dot menu in Chrome</li>
              <li>Select "Add to Home screen"</li>
              <li>Confirm the installation</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Mobile (iOS):</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Tap the Share button in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
