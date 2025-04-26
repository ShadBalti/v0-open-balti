"use client"

import type { IWord } from "@/models/Word"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface WordListProps {
  words: IWord[]
  direction: "balti-to-english" | "english-to-balti"
  onEdit: (word: IWord) => void
  onDelete: (id: string) => void
}

export default function WordList({ words, direction, onEdit, onDelete }: WordListProps) {
  if (words.length === 0) {
    return (
      <div className="text-center py-12 bg-muted rounded-lg">
        <p className="text-muted-foreground">No words found. Add some words to get started!</p>
      </div>
    )
  }

  const isBaltiToEnglish = direction === "balti-to-english"
  const firstColumnHeader = isBaltiToEnglish ? "Balti" : "English"
  const secondColumnHeader = isBaltiToEnglish ? "English" : "Balti"

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">{firstColumnHeader}</TableHead>
            <TableHead className="w-[40%]">{secondColumnHeader}</TableHead>
            <TableHead className="w-[20%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {words.map((word) => (
            <TableRow key={word._id}>
              <TableCell className="font-medium">{isBaltiToEnglish ? word.balti : word.english}</TableCell>
              <TableCell>{isBaltiToEnglish ? word.english : word.balti}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" onClick={() => onEdit(word)} aria-label="Edit word">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => onDelete(word._id)} aria-label="Delete word">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
