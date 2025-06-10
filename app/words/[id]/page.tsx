import type { Metadata } from "next"
import { notFound } from "next/navigation"
import dbConnect from "@/lib/mongodb"
import Word from "@/models/Word"
import { WordDetail } from "@/components/word-detail"
import { StructuredData } from "@/components/structured-data"
import type { IWord } from "@/models/Word"

interface WordPageProps {
  params: { id: string }
}

async function getWord(id: string): Promise<IWord | null> {
  try {
    await dbConnect()
    const word = await Word.findById(id).lean()

    if (!word) {
      return null
    }

    // Convert MongoDB ObjectId to string for serialization
    return {
      ...word,
      _id: word._id.toString(),
      createdAt: word.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: word.updatedAt?.toISOString() || new Date().toISOString(),
    } as IWord
  } catch (error) {
    console.error("Error fetching word:", error)
    return null
  }
}

export async function generateMetadata({ params }: WordPageProps): Promise<Metadata> {
  const word = await getWord(params.id)

  if (!word) {
    return {
      title: "Word Not Found - OpenBalti Dictionary",
      description: "The requested word could not be found in the OpenBalti Dictionary.",
    }
  }

  const title = `${word.balti} - ${word.english} | OpenBalti Dictionary`
  const description = `Learn the Balti word "${word.balti}" meaning "${word.english}". ${
    word.usageNotes ? word.usageNotes.substring(0, 100) + "..." : ""
  } Explore etymology, pronunciation, and cultural context.`

  return {
    title,
    description,
    keywords: [
      word.balti,
      word.english,
      "Balti language",
      "dictionary",
      "translation",
      ...(word.categories || []),
      ...(word.relatedWords || []),
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: `/words/${word._id}`,
      siteName: "OpenBalti Dictionary",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/words/${word._id}`,
    },
  }
}

export default async function WordPage({ params }: WordPageProps) {
  const word = await getWord(params.id)

  if (!word) {
    notFound()
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: word.balti,
    description: word.english,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "OpenBalti Dictionary",
      description: "A comprehensive dictionary of the Balti language",
    },
    ...(word.phonetic && { phoneticText: word.phonetic }),
    ...(word.categories && {
      about: word.categories.map((category) => ({
        "@type": "Thing",
        name: category,
      })),
    }),
    ...(word.dialect && {
      spatialCoverage: {
        "@type": "Place",
        name: word.dialect,
      },
    }),
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <a href="/" className="hover:text-foreground">
              Home
            </a>
            <span>/</span>
            <a href="/words" className="hover:text-foreground">
              Dictionary
            </a>
            <span>/</span>
            <span className="text-foreground font-medium">{word.balti}</span>
          </nav>
        </div>

        <WordDetail word={word} />
      </div>
    </>
  )
}

// Generate static params for popular words (optional optimization)
export async function generateStaticParams() {
  try {
    await dbConnect()
    // Get the most popular or recently added words for static generation
    const words = await Word.find({}).sort({ createdAt: -1 }).limit(100).select("_id").lean()

    return words.map((word) => ({
      id: word._id.toString(),
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}
