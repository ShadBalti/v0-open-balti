"use client"

import { useState, useEffect } from "react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import WordList from "@/components/word-list"
import WordForm from "@/components/word-form"
import SearchBar from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { IWord } from "@/models/Word"

export default function WordsPage() {
  const [words, setWords] = useState<IWord[]>([])
  const [loading, setLoading] = useState(true)
  const [direction, setDirection] = useState<"balti-to-english" | "english-to-balti">("balti-to-english")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingWord, setEditingWord] = useState<IWord | null>(null)

  useEffect(() => {
    fetchWords()
  }, [searchTerm])

  const fetchWords = async () => {
    try {
      setLoading(true)
      const url = searchTerm ? `/api/words?search=${encodeURIComponent(searchTerm)}` : "/api/words"

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setWords(result.data)
      } else {
        toast.error(result.error || "Failed to fetch words")
      }
    } catch (error) {
      console.error("Error fetching words:", error)
      toast.error("Failed to fetch words")
    } finally {
      setLoading(false)
    }
  }

  const handleAddWord = async (wordData: { balti: string; english: string }) => {
    try {
      const response = await fetch("/api/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wordData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Word added successfully!")
        fetchWords()
      } else {
        toast.error(result.error || "Failed to add word")
      }
    } catch (error) {
      console.error("Error adding word:", error)
      toast.error("Failed to add word")
    }
  }

  const handleUpdateWord = async (id: string, wordData: { balti: string; english: string }) => {
    try {
      const response = await fetch(`/api/words/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wordData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Word updated successfully!")
        setEditingWord(null)
        fetchWords()
      } else {
        toast.error(result.error || "Failed to update word")
      }
    } catch (error) {
      console.error("Error updating word:", error)
      toast.error("Failed to update word")
    }
  }

  const handleDeleteWord = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this word?")) {
      return
    }

    try {
      const response = await fetch(`/api/words/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Word deleted successfully!")
        fetchWords()
      } else {
        toast.error(result.error || "Failed to delete word")
      }
    } catch (error) {
      console.error("Error deleting word:", error)
      toast.error("Failed to delete word")
    }
  }

  const toggleDirection = () => {
    setDirection((prev) => (prev === "balti-to-english" ? "english-to-balti" : "balti-to-english"))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <Button onClick={toggleDirection} className="whitespace-nowrap">
          {direction === "balti-to-english" ? "Balti → English" : "English → Balti"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading words...</span>
        </div>
      ) : (
        <WordList words={words} direction={direction} onEdit={setEditingWord} onDelete={handleDeleteWord} />
      )}

      <div className="bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">{editingWord ? "Edit Word" : "Add New Word"}</h2>
        <WordForm
          initialData={editingWord}
          onSubmit={editingWord ? (data) => handleUpdateWord(editingWord._id, data) : handleAddWord}
          onCancel={editingWord ? () => setEditingWord(null) : undefined}
        />
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  )
}
