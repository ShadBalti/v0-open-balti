import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { generateMetadata as generateUserMetadata } from "@/lib/metadata"
import UserProfile from "@/components/profile/user-profile"

export async function generateMetadata({ params }: { params: { id: string } }) {
  return generateUserMetadata("User Profile", "View contributor profile and statistics")
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-64 w-full" />
            </div>
          }
        >
          <UserProfile userId={params.id} />
        </Suspense>
      </div>
    </div>
  )
}
