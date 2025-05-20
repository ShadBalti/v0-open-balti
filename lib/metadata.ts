import type { Metadata } from "next"

// Base metadata configuration
const baseMetadata = {
  title: {
    default: "OpenBalti Dictionary",
    template: "%s | OpenBalti Dictionary",
  },
  description:
    "A comprehensive online dictionary for the Balti language, preserving and promoting the linguistic heritage of Baltistan.",
  keywords: ["Balti", "dictionary", "language", "Baltistan", "linguistics", "translation", "learning"],
  authors: [{ name: "OpenBalti Team" }],
  creator: "OpenBalti Community",
  publisher: "OpenBalti Project",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app",
    siteName: "OpenBalti Dictionary",
    title: "OpenBalti Dictionary",
    description: "A comprehensive online dictionary for the Balti language",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "OpenBalti Dictionary Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenBalti Dictionary",
    description: "A comprehensive online dictionary for the Balti language",
    images: ["/logo.png"],
    creator: "@openbalti",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-touch-icon-precomposed.png",
    },
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
    },
  },
}

// Generate metadata for specific pages
export function generateMetadata(
  pageTitle?: string,
  pageDescription?: string,
  pageImage?: string,
  pageUrl?: string,
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  return {
    ...baseMetadata,
    title: pageTitle || baseMetadata.title,
    description: pageDescription || baseMetadata.description,
    openGraph: {
      ...baseMetadata.openGraph,
      title: pageTitle || baseMetadata.openGraph.title,
      description: pageDescription || baseMetadata.openGraph.description,
      images: pageImage
        ? [
            {
              url: pageImage.startsWith("http") ? pageImage : `${baseUrl}${pageImage}`,
              width: 1200,
              height: 630,
              alt: pageTitle || "OpenBalti Dictionary",
            },
          ]
        : baseMetadata.openGraph.images,
      url: pageUrl ? `${baseUrl}${pageUrl}` : baseMetadata.openGraph.url,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: pageTitle || baseMetadata.twitter.title,
      description: pageDescription || baseMetadata.twitter.description,
      images: pageImage
        ? [pageImage.startsWith("http") ? pageImage : `${baseUrl}${pageImage}`]
        : baseMetadata.twitter.images,
    },
    alternates: {
      ...baseMetadata.alternates,
      canonical: pageUrl || baseMetadata.alternates.canonical,
    },
  }
}

export default baseMetadata
