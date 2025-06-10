"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"

const Header = () => {
  const { data: session } = useSession()

  const navigationItems = [
    { name: "Home", href: "/", authRequired: false },
    { name: "Blog", href: "/blog", authRequired: false },
    { name: "Contribute", href: "/contribute", authRequired: false },
    {
      name: "Forum",
      href: "/forum",
      authRequired: false,
    },
    { name: "Dashboard", href: "/dashboard", authRequired: true },
  ]

  return (
    <header className="bg-gray-100 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          My App
        </Link>

        <nav>
          <ul className="flex space-x-4">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="hover:text-gray-500">
                  {item.name}
                </Link>
              </li>
            ))}
            {session ? (
              <li>
                <button onClick={() => signOut()} className="hover:text-gray-500">
                  Sign Out
                </button>
              </li>
            ) : (
              <li>
                <button onClick={() => signIn()} className="hover:text-gray-500">
                  Sign In
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
