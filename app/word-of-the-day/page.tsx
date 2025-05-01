import { Suspense } from "react"
import type { Metadata } from "next"
import { PreviousWordsOfTheDay } from "@/components/previous-words-of-the-day"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Word of the Day Archive | OpenBalti Dictionary",
  description: "Browse through our collection of previous Words of the Day from the OpenBalti Dictionary.",
}

export default function WordOfTheDayArchivePage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Word of the Day Archive</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
            Browse through our collection of previous Words of the Day
          </p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
          }
        >
          <PreviousWordsOfTheDay />
        </Suspense>
      </div>
    </div>
  )
}
