import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContributePage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Contribute to OpenBalti</h1>
          <p className="text-muted-foreground">Help us preserve and document the Balti language</p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            The OpenBalti Dictionary is a community-driven project that relies on contributions from people like you.
            Whether you're a native speaker, a linguist, or simply interested in language preservation, there are many
            ways you can help.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New Words</CardTitle>
              <CardDescription>Contribute to the dictionary by adding new words and translations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you know Balti words that aren't in our dictionary yet, you can add them directly through our
                interface. Each contribution helps make the dictionary more comprehensive.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/">Add Words</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review and Edit</CardTitle>
              <CardDescription>Help ensure accuracy by reviewing and editing existing entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review existing dictionary entries for accuracy and completeness. If you find errors or have suggestions
                for improvement, you can edit entries directly.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/">Review Words</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Contributions</CardTitle>
              <CardDescription>Help improve the OpenBalti platform itself</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you have technical skills, you can contribute to the development of the OpenBalti platform. We
                welcome contributions to our codebase, including bug fixes, new features, and improvements to the user
                interface.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spread the Word</CardTitle>
              <CardDescription>Help us reach more people by sharing the project</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                One of the simplest ways to contribute is by sharing the OpenBalti Dictionary with others who might be
                interested. The more people who know about and use the dictionary, the more successful our preservation
                efforts will be.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href="mailto:?subject=OpenBalti%20Dictionary&body=Check%20out%20the%20OpenBalti%20Dictionary%20project%20at%20https://openbalti.org">
                  Share by Email
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have questions, suggestions, or would like to contribute in other ways, please don't hesitate to
            reach out to us.
          </p>
          <Button asChild>
            <Link href="mailto:contact@openbalti.org">Email Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
