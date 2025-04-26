import { generateMetadata } from "@/lib/metadata"

export const metadata = generateMetadata(
  "About the Balti Language",
  "Learn about the history, origin, and cultural significance of the Balti language and the OpenBalti dictionary project.",
)

export default function AboutPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About the Balti Language</h1>
          <p className="text-muted-foreground">Learn about the history and significance of the Balti language</p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            Balti is a Tibetic language spoken primarily in the Baltistan region of Gilgit-Baltistan, Pakistan, and
            parts of Ladakh, India. It is closely related to Tibetan and is written in a modified form of the Tibetan
            script.
          </p>

          <h2 id="history-and-origin">History and Origin</h2>
          <p>
            The Balti language has a rich history dating back several centuries. It developed as a distinct dialect of
            Tibetan as the Baltistan region became culturally and politically separated from Tibet proper. The language
            has been influenced by neighboring languages including Ladakhi, Purigi, and more recently, Urdu.
          </p>

          <h2 id="current-status">Current Status</h2>
          <p>
            Today, Balti is spoken by approximately 400,000 people. While it remains the primary language of
            communication in Baltistan, it faces challenges from more dominant languages in official and educational
            contexts. There are ongoing efforts to preserve and document the language, including the creation of
            dictionaries and teaching materials.
          </p>

          <h2 id="writing-system">Writing System</h2>
          <p>
            Traditionally, Balti has been written in a script called Tibetan Balti or "Yige", which is a variant of the
            Tibetan script. In recent decades, many speakers have also adopted a modified Perso-Arabic script for
            writing Balti, reflecting the cultural influences in the region.
          </p>

          <h2 id="cultural-significance">Cultural Significance</h2>
          <p>
            The Balti language is a crucial carrier of cultural heritage for the Balti people. It preserves ancient
            traditions, folklore, and knowledge systems that might otherwise be lost. The language is used in
            traditional songs, poetry, and storytelling that form an important part of Balti cultural identity.
          </p>

          <h2 id="about-openbalti">About OpenBalti</h2>
          <p>
            The OpenBalti Dictionary project aims to create a comprehensive digital resource for the Balti language. By
            documenting words and their meanings, we hope to contribute to the preservation and revitalization of this
            important language. This open-source project welcomes contributions from speakers, linguists, and anyone
            interested in language preservation.
          </p>
        </div>
      </div>
    </div>
  )
}
