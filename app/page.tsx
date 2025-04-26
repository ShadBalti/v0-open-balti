import WordsPage from "@/components/words-page"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">OpenBalti Dictionary</h1>
        <WordsPage />
      </div>
    </main>
  )
}
