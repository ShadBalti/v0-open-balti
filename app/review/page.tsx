import ReviewPage from "@/components/review-page"

export default function Review() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Review Dictionary</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
            Help improve the OpenBalti dictionary by reviewing and editing entries
          </p>
        </div>
        <ReviewPage />
      </div>
    </div>
  )
}
