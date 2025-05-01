export default function Home() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">OpenBalti Dictionary</h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
            Explore and contribute to the digital preservation of the Balti language
          </p>
        </div>

        <div className="text-center">
          <p>Welcome to the OpenBalti Dictionary project.</p>
          <p className="mt-4">
            <a href="/words" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Browse Dictionary
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
