import Image from "next/image"
import Link from "next/link"

interface AuthorInfoProps {
  author: {
    _id: string
    name: string
    image?: string
    bio?: string
  }
  date: string
  readingTime?: number
}

export function AuthorInfo({ author, date, readingTime }: AuthorInfoProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex items-center gap-4 py-4">
      {author.image && (
        <Image
          src={author.image || "/placeholder.svg"}
          alt={author.name}
          width={56}
          height={56}
          className="rounded-full"
        />
      )}
      <div className="flex-1">
        <Link href={`/profile/${author._id}`} className="font-semibold hover:underline">
          {author.name}
        </Link>
        {author.bio && <p className="text-sm text-muted-foreground">{author.bio}</p>}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{formattedDate}</span>
          {readingTime && <span>{readingTime} min read</span>}
        </div>
      </div>
    </div>
  )
}
