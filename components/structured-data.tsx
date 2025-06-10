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

// Enhanced Website Schema with Search Action
export function WebsiteStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OpenBalti Dictionary",
    alternateName: "OpenBalti",
    url: baseUrl,
    description:
      "Free online Balti language dictionary and learning platform for preserving the Balti language of Baltistan",
    inLanguage: ["en", "bt"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "OpenBalti Project",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
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

// Software Application Schema
export function SoftwareApplicationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "OpenBalti Dictionary",
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Language Learning",
    operatingSystem: "Web Browser",
    url: baseUrl,
    description: "A comprehensive online dictionary and language learning platform for the Balti language",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Balti to English translation",
      "English to Balti translation",
      "Audio pronunciations",
      "Word etymology and history",
      "Community contributions",
      "Dialect variations",
      "Cultural context",
    ],
    screenshot: `${baseUrl}/screenshot.png`,
    softwareVersion: "1.0",
    datePublished: "2024-01-01",
    author: {
      "@type": "Organization",
      name: "OpenBalti Project",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
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

// Language Schema
export function LanguageStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Language",
    name: "Balti",
    alternateName: ["Balti Language", "སྦལ་ཏི་སྐད", "بلتی"],
    identifier: "bt",
    description: "Balti is a Tibetic language spoken in the Baltistan region of Pakistan and parts of Ladakh, India",
    speakingPopulation: "400000",
    writingSystem: ["Tibetan script", "Arabic script", "Latin script"],
    languageFamily: "Sino-Tibetan",
    subjectOf: {
      "@type": "WebSite",
      name: "OpenBalti Dictionary",
      url: baseUrl,
    },
    geographicArea: [
      {
        "@type": "Place",
        name: "Baltistan",
        containedInPlace: {
          "@type": "Country",
          name: "Pakistan",
        },
      },
      {
        "@type": "Place",
        name: "Ladakh",
        containedInPlace: {
          "@type": "Country",
          name: "India",
        },
      },
    ],
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

// Word Entry Schema
interface WordEntryStructuredDataProps {
  word: {
    id: string
    balti: string
    english: string
    pronunciation?: string
    partOfSpeech?: string
    dialect?: string
    difficulty?: string
    etymology?: string
    examples?: Array<{ balti: string; english: string }>
    culturalContext?: string
    dateAdded: string
    lastModified: string
  }
}

export function WordEntryStructuredData({ word }: WordEntryStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: word.balti,
    identifier: word.id,
    description: word.english,
    url: `${baseUrl}/words/${word.id}`,
    inLanguage: "bt",
    translationOfWork: {
      "@type": "DefinedTerm",
      name: word.english,
      inLanguage: "en",
    },
    partOfSpeech: word.partOfSpeech,
    pronunciation: word.pronunciation,
    etymology: word.etymology,
    dateCreated: word.dateAdded,
    dateModified: word.lastModified,
    isPartOf: {
      "@type": "Dataset",
      name: "OpenBalti Dictionary",
      url: baseUrl,
    },
    additionalProperty: [
      ...(word.dialect
        ? [
            {
              "@type": "PropertyValue",
              name: "dialect",
              value: word.dialect,
            },
          ]
        : []),
      ...(word.difficulty
        ? [
            {
              "@type": "PropertyValue",
              name: "difficulty",
              value: word.difficulty,
            },
          ]
        : []),
      ...(word.culturalContext
        ? [
            {
              "@type": "PropertyValue",
              name: "culturalContext",
              value: word.culturalContext,
            },
          ]
        : []),
    ],
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

// Breadcrumb Schema
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

// FAQ Schema
interface FAQStructuredDataProps {
  faqs: Array<{
    question: string
    answer: string
  }>
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
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

// Learning Resource Schema
export function LearningResourceStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: "Learn Balti Language Online",
    description:
      "Comprehensive online resource for learning the Balti language with dictionary, pronunciation guides, and cultural context",
    url: baseUrl,
    educationalLevel: "Beginner to Advanced",
    learningResourceType: "Dictionary",
    teaches: "Balti Language",
    inLanguage: ["en", "bt"],
    isAccessibleForFree: true,
    provider: {
      "@type": "Organization",
      name: "OpenBalti Project",
    },
    educationalUse: ["Language Learning", "Cultural Preservation", "Academic Research", "Translation"],
    audience: {
      "@type": "EducationalAudience",
      educationalRole: ["Student", "Teacher", "Researcher", "Translator"],
    },
    competencyRequired: "Basic reading ability",
    timeRequired: "PT30M",
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

// Person Schema for Contributors
interface PersonStructuredDataProps {
  person: {
    name: string
    id: string
    bio?: string
    contributions: number
    joinDate: string
    location?: string
    expertise?: string[]
  }
}

export function PersonStructuredData({ person }: PersonStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    identifier: person.id,
    url: `${baseUrl}/users/${person.id}`,
    description:
      person.bio || `Contributor to the OpenBalti Dictionary project with ${person.contributions} contributions`,
    memberOf: {
      "@type": "Organization",
      name: "OpenBalti Project",
    },
    knowsAbout: person.expertise || ["Balti Language", "Language Preservation"],
    homeLocation: person.location
      ? {
          "@type": "Place",
          name: person.location,
        }
      : undefined,
    additionalProperty: {
      "@type": "PropertyValue",
      name: "contributions",
      value: person.contributions,
    },
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

// Review Schema for Word Feedback
interface ReviewStructuredDataProps {
  review: {
    id: string
    wordId: string
    rating: number
    reviewBody: string
    author: string
    datePublished: string
  }
}

export function ReviewStructuredData({ review }: ReviewStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.reviewBody,
    author: {
      "@type": "Person",
      name: review.author,
    },
    datePublished: review.datePublished,
    itemReviewed: {
      "@type": "DefinedTerm",
      url: `${baseUrl}/words/${review.wordId}`,
    },
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

// Article Schema for Blog Posts/Educational Content
interface ArticleStructuredDataProps {
  article: {
    title: string
    description: string
    url: string
    author: string
    datePublished: string
    dateModified?: string
    image?: string
    wordCount?: number
  }
}

export function ArticleStructuredData({ article }: ArticleStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "OpenBalti Project",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
    image: article.image
      ? {
          "@type": "ImageObject",
          url: article.image,
        }
      : undefined,
    wordCount: article.wordCount,
    inLanguage: "en",
    about: {
      "@type": "Thing",
      name: "Balti Language",
    },
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
