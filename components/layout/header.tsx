import type React from "react"
import Link from "next/link"

interface NavItem {
  title: string
  href: string
  description: string
}

const navigationItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    description: "Go to the home page",
  },
  {
    title: "About",
    href: "/about",
    description: "Learn more about us",
  },
  {
    title: "Contact",
    href: "/contact",
    description: "Get in touch with us",
  },
  {
    title: "PWA Test",
    href: "/pwa-test",
    description: "Test PWA functionality",
  },
]

const Header: React.FC = () => {
  return (
    <header className="bg-gray-100 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          My App
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {navigationItems.map((item) => (
              <li key={item.title}>
                <Link href={item.href} className="hover:text-blue-500">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
