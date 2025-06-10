import { baseMetadata } from "@/lib/metadata"

interface DictionaryStructuredDataProps {
  url: string
  name?: string
  description?: string
  wordCount?: number
}

export function DictionaryStructuredData({
  url,
  name = "OpenBalti Dictionary",
  description = baseMetadata.description as string,
  wordCount,
}: DictionaryStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: name,
    description: description,
    url: url,
    keywords: baseMetadata.keywords?.join(", "),
    creator: {
      "@type": "Organization",
      name: "OpenBalti Project",
      url: baseUrl,
    },
    license: `${baseUrl}/license`,
    isAccessibleForFree: true,
    dateModified: new Date().toISOString(),
  }

  if (wordCount) {
    structuredData["size"] = `${wordCount} entries`
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

export function OrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OpenBalti Project",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: ["https://twitter.com/openbalti", "https://github.com/ShadBalti/openbalti"],
    description: "A community-driven project dedicated to preserving and documenting the Balti language",
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

interface WordStructuredDataProps {
  word: {
    id: string
    balti: string
    english: string
    urdu?: string
    pronunciation?: string
    partOfSpeech?: string
    difficulty?: string
    dialect?: string
    examples?: Array<{
      balti: string
      english: string
    }>
  }
  url: string
}

export function WordStructuredData({ word, url }: WordStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: word.balti,
    description: word.english,
    url: url,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "OpenBalti Dictionary",
      url: baseUrl,
    },
    ...(word.pronunciation && {
      pronunciation: word.pronunciation,
    }),
    ...(word.partOfSpeech && {
      partOfSpeech: word.partOfSpeech,
    }),
    ...(word.examples &&
      word.examples.length > 0 && {
        example: word.examples.map((ex) => ({
          "@type": "Example",
          text: ex.balti,
          description: ex.english,
        })),
      }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

// Generic StructuredData component for backward compatibility
export function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}
