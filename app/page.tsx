import WordsPage from "@/components/words-page"
import { Suspense } from "react"
import { DictionaryStructuredData, FAQStructuredData } from "@/components/structured-data"
import { WordsPageSkeleton } from "@/components/skeletons/words-page-skeleton"
import { HomePageContent } from "@/components/HomePageContent"

const homepageFAQs = [
  {
    question: "What is the OpenBalti Dictionary?",
    answer:
      "OpenBalti Dictionary is a free, community-driven online dictionary dedicated to preserving and documenting the Balti language. It provides translations, pronunciations, cultural context, and etymology for Balti words.",
  },
  {
    question: "How can I contribute to the dictionary?",
    answer:
      "You can contribute by adding new words, providing translations, recording pronunciations, sharing cultural context, or helping with translations. Simply create an account and start contributing to help preserve the Balti language.",
  },
  {
    question: "Is the OpenBalti Dictionary free to use?",
    answer:
      "Yes, the OpenBalti Dictionary is completely free to use. Our mission is to make the Balti language accessible to everyone and preserve it for future generations.",
  },
  {
    question: "What dialects of Balti are included?",
    answer:
      "The dictionary includes various dialects of Balti spoken across Baltistan, including Skardu, Khaplu, Shigar, and other regional variations. Each entry is tagged with its specific dialect when applicable.",
  },
  {
    question: "Can I use the dictionary offline?",
    answer:
      "Currently, the OpenBalti Dictionary is a web-based platform that requires an internet connection. However, we are working on offline capabilities for future releases.",
  },
]

export default function Home() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Free Online Balti Dictionary - Learn Balti Language
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
            Discover the rich heritage of the Balti language with our comprehensive online dictionary. Explore
            translations, pronunciations, and cultural context for thousands of Balti words.
          </p>
        </div>
        <Suspense fallback={<WordsPageSkeleton />}>
          <WordsPage />
        </Suspense>
        <HomePageContent />
      </div>
      <DictionaryStructuredData url="/" />
      <FAQStructuredData faqs={homepageFAQs} />
    </div>
  )
}
