import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { generateMetadata } from "@/lib/metadata"
import AdminDashboard from "@/components/admin/admin-dashboard"

export const metadata = generateMetadata(
  "Admin Dashboard",
  "Comprehensive administration panel for managing the OpenBalti dictionary platform.",
)

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "admin" && session.user.role !== "owner")) {
    redirect("/")
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, content, and platform analytics</p>
        </div>
        <AdminDashboard />
      </div>
    </div>
  )
}
