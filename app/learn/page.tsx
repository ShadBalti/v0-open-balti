import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { generateMetadata } from "@/lib/metadata"
import LearningHub from "@/components/learning/learning-hub"

export const metadata = generateMetadata(
  "Learn Balti",
  "Interactive learning tools and flashcards to master the Balti language.",
)

export default async function LearnPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Learn Balti</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
            Master the Balti language with interactive flashcards, quizzes, and personalized learning paths
          </p>
        </div>
        <LearningHub user={session?.user} />
      </div>
    </div>
  )
}
