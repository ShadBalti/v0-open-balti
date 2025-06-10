import { Suspense } from "react"
import { WordsPageSkeleton } from "@/components/skeletons/words-page-skeleton"
import { HomePageContent } from "@/components/HomePageContent"
import { StructuredData } from "@/components/structured-data"
import { WordOfTheDay } from "@/components/ui/word-of-the-day"
import { CommunityStats } from "@/components/community-stats"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, TrendingUp, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            OpenBalti Dictionary
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
            Explore and contribute to the digital preservation of the Balti language
          </p>

          {/* Search Bar */}
          <div className="mx-auto max-w-2xl">
            <SearchBar />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/contribute">
                <BookOpen className="mr-2 h-5 w-5" />
                Add Words
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/forum">
                <MessageSquare className="mr-2 h-5 w-5" />
                Join Discussion
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contributors">
                <Users className="mr-2 h-5 w-5" />
                Contributors
              </Link>
            </Button>
          </div>
        </div>

        {/* Featured Content Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Word of the Day */}
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
              <WordOfTheDay />
            </Suspense>
          </div>

          {/* Community Stats */}
          <div>
            <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
              <CommunityStats />
            </Suspense>
          </div>
        </div>

        {/* Recent Words Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Words</h2>
            <Button asChild variant="outline">
              <Link href="/words">
                <TrendingUp className="mr-2 h-4 w-4" />
                View All Words
              </Link>
            </Button>
          </div>

          <Suspense fallback={<WordsPageSkeleton />}>
            <HomePageContent />
          </Suspense>
        </div>

        {/* Features Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Rich Dictionary</h3>
            <p className="text-muted-foreground mb-4">
              Comprehensive word entries with pronunciations, examples, and cultural context
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/words">Browse Words</Link>
            </Button>
          </div>

          <div className="rounded-lg border p-6 text-center">
            <Users className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Community Driven</h3>
            <p className="text-muted-foreground mb-4">
              Built by native speakers and language enthusiasts working together
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/contributors">Meet Contributors</Link>
            </Button>
          </div>

          <div className="rounded-lg border p-6 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Etymology & History</h3>
            <p className="text-muted-foreground mb-4">Discover the historical origins and evolution of Balti words</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/forum">Join Discussions</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Structured Data */}
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "OpenBalti Dictionary",
          description: "Digital preservation and exploration of the Balti language",
          url: process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.org",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.org"}/words?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
          publisher: {
            "@type": "Organization",
            name: "OpenBalti Dictionary",
            description: "Community-driven digital dictionary for Balti language preservation",
          },
        }}
      />
    </div>
  )
}
