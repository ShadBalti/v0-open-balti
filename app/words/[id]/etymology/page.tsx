import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Word from "@/models/Word"
import WordEtymology from "@/models/WordEtymology"
import { EtymologyManagement } from "@/components/etymology-management"
import type { IWord } from "@/models/Word"
import type { IWordEtymology } from "@/models/WordEtymology"

interface EtymologyPageProps {
  params: { id: string }
}

async function getWordWithEtymology(id: string): Promise<{
  word: IWord | null
  etymology: IWordEtymology | null
}> {
  try {
    await dbConnect()

    const [word, etymology] = await Promise.all([
      Word.findById(id).lean(),
      WordEtymology.findOne({ wordId: id })
        .populate("createdBy", "name email")
        .populate("verifiedBy", "name email")
        .lean(),
    ])

    if (!word) {
      return { word: null, etymology: null }
    }

    return {
      word: {
        ...word,
        _id: word._id.toString(),
        createdAt: word.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: word.updatedAt?.toISOString() || new Date().toISOString(),
      } as IWord,
      etymology: etymology
        ? ({
            ...etymology,
            _id: etymology._id.toString(),
            wordId: etymology.wordId.toString(),
            createdBy: etymology.createdBy
              ? {
                  ...etymology.createdBy,
                  _id: etymology.createdBy._id.toString(),
                }
              : null,
            verifiedBy: etymology.verifiedBy
              ? {
                  ...etymology.verifiedBy,
                  _id: etymology.verifiedBy._id.toString(),
                }
              : null,
            createdAt: etymology.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: etymology.updatedAt?.toISOString() || new Date().toISOString(),
          } as IWordEtymology)
        : null,
    }
  } catch (error) {
    console.error("Error fetching word and etymology:", error)
    return { word: null, etymology: null }
  }
}

export async function generateMetadata({ params }: EtymologyPageProps): Promise<Metadata> {
  const { word } = await getWordWithEtymology(params.id)

  if (!word) {
    return {
      title: "Etymology Not Found - OpenBalti Dictionary",
      description: "The requested word etymology could not be found.",
    }
  }

  const title = `Etymology of "${word.balti}" | OpenBalti Dictionary`
  const description = `Explore the historical origins and linguistic evolution of the Balti word "${word.balti}" (${word.english}). Learn about its etymology, cultural context, and related languages.`

  return {
    title,
    description,
    keywords: [
      word.balti,
      word.english,
      "etymology",
      "Balti language history",
      "linguistic evolution",
      "word origins",
      "historical linguistics",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: `/words/${word._id}/etymology`,
      siteName: "OpenBalti Dictionary",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/words/${word._id}/etymology`,
    },
  }
}

export default async function EtymologyPage({ params }: EtymologyPageProps) {
  const session = await getServerSession(authOptions)

  // Redirect to sign-in if not authenticated
  if (!session) {
    redirect(`/auth/signin?callbackUrl=/words/${params.id}/etymology`)
  }

  const { word, etymology } = await getWordWithEtymology(params.id)

  if (!word) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
          <a href={`/words/${word._id}`} className="hover:text-foreground">
            {word.balti}
          </a>
          <span>/</span>
          <span className="text-foreground font-medium">Etymology</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Etymology of "{word.balti}"</h1>
          <p className="text-muted-foreground">
            Historical origins and linguistic evolution of the Balti word meaning "{word.english}"
          </p>
        </div>
      </div>

      <EtymologyManagement word={word} existingEtymology={etymology} userId={session.user.id} />
    </div>
  )
}
