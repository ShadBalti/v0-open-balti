import { PWATester } from "@/components/pwa/pwa-tester"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PWA Testing - OpenBalti",
  description: "Test Progressive Web App functionality",
}

export default function PWATestPage() {
  return (
    <div className="container mx-auto py-8">
      <PWATester />
    </div>
  )
}
