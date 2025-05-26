import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SkipLink } from "@/components/layout/skip-link"
import { baseMetadata } from "@/lib/metadata"
import { OrganizationStructuredData } from "@/components/structured-data"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/auth/session-provider"
import { GoogleAnalytics } from "@/components/analytics"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })

export const metadata: Metadata = {
  ...baseMetadata,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OpenBalti Dictionary",
  },
  formatDetection: {
    telephone: false,
  },
  icons: [
    { rel: "apple-touch-icon", url: "/logo.png" },
    { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon.ico" },
    { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicon.ico" },
  ],
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="6qYt2H85MUvuaHNGAZKRY87nANOkZ7hRfCgPcs6EOKY" />
        <GoogleAnalytics />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <PWAProvider>
          <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <SkipLink />
              <div className="relative min-h-screen flex flex-col">
                <Suspense fallback={<div className="h-16 border-b"></div>}>
                  <Header />
                </Suspense>
                <main id="main-content" className="flex-1" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
              <OrganizationStructuredData />
            </ThemeProvider>
          </SessionProvider>
        </PWAProvider>
      </body>
    </html>
  )
}
