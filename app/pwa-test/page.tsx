import { PWADiagnostics } from "@/components/pwa/pwa-diagnostics"

export default function PWATestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">PWA Testing & Diagnostics</h1>
        <p className="text-muted-foreground">Use this page to test and diagnose PWA functionality on your device.</p>
      </div>

      <PWADiagnostics />
    </div>
  )
}
