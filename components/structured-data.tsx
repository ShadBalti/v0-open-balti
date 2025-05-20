interface DictionaryEntryProps {
  word: {
    _id: string
    balti: string
    english: string
    phonetic?: string
    categories?: string[]
    dialect?: string
    usageNotes?: string
    relatedWords?: string[]
    difficultyLevel?: string
    createdAt: Date
    updatedAt: Date
  }
  url: string
}

export function DictionaryEntryStructuredData({ word, url }: DictionaryEntryProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": fullUrl,
    name: word.balti,
    description: `${word.balti} - ${word.english}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "OpenBalti Dictionary",
      description: "A comprehensive dictionary of the Balti language",
    },
    termCode: word.phonetic || word.balti,
    ...(word.categories && { keywords: word.categories.join(", ") }),
    dateCreated: word.createdAt.toISOString(),
    dateModified: word.updatedAt.toISOString(),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}

interface WebsiteStructuredDataProps {
  url?: string
}

export function WebsiteStructuredData({ url }: WebsiteStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"
  const fullUrl = url ? (url.startsWith("http") ? url : `${baseUrl}${url}`) : baseUrl

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "OpenBalti Dictionary",
    description: "A comprehensive online dictionary for the Balti language",
    publisher: {
      "@type": "Organization",
      name: "OpenBalti Project",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}

export { DictionaryEntryStructuredData as DictionaryStructuredData }

// This ensures backward compatibility with existing imports

export default {
  DictionaryStructuredData: DictionaryEntryStructuredData,
  WebsiteStructuredData,
  BreadcrumbStructuredData,
}
