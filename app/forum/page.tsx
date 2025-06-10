import { DiscussionForums } from "@/components/discussion-forums"
import { generateMetadata } from "@/lib/metadata"

export const metadata = generateMetadata(
  "Discussion Forums - OpenBalti Community",
  "Join discussions about the Balti language, culture, etymology, and language learning with the OpenBalti community.",
)

export default function ForumPage() {
  return (
    <div className="container py-8 md:py-12">
      <DiscussionForums />
    </div>
  )
}
