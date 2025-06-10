import { Suspense } from "react"
import { WordsPageSkeleton } from "@/components/skeletons/words-page-skeleton"
import WordsPage from "@/components/words-page"
import { StructuredData } from "@/components/structured-data"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Browse Words - OpenBalti Dictionary",
  description:
    "Explore the comprehensive collection of Balti words with meanings, pronunciations, and cultural context.",
  openGraph: {
    title: "Browse Words - OpenBalti Dictionary",
    description:
      "Explore the comprehensive collection of Balti words with meanings, pronunciations, and cultural context.",
    type: "website",
  },
}

export default function WordsBrowsePage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Browse Words</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
            Discover and explore the rich vocabulary of the Balti language
          </p>
        </div>

        <Suspense fallback={<WordsPageSkeleton />}>
          <WordsPage />
        </Suspense>
      </div>

      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Balti Words Collection",
          description: "Comprehensive collection of Balti language words with definitions and cultural context",
          url: `${process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.org"}/words`,
          mainEntity: {
            "@type": "ItemList",
            name: "Balti Dictionary Entries",
            description: "Dictionary entries for Balti language words",
          },
        }}
      />
    </div>
  )
}
