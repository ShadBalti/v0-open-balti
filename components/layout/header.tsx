"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Search, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserDropdown } from "@/components/auth/user-dropdown"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

const routes = [
  {
    href: "/",
    label: "Home",
    icon: <BookOpen className="h-4 w-4 mr-2" />,
  },
  {
    href: "/words",
    label: "Dictionary",
    icon: <Search className="h-4 w-4 mr-2" />,
  },
  {
    href: "/contribute",
    label: "Contribute",
    icon: <BookOpen className="h-4 w-4 mr-2" />,
  },
  {
    href: "/about",
    label: "About",
    icon: <BookOpen className="h-4 w-4 mr-2" />,
  },
]

export function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur transition-all",
        isScrolled ? "shadow-sm" : "",
      )}
    >
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">OpenBalti</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center",
                  pathname === route.href ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserDropdown />
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="pr-0">
              <Link href="/" className="flex items-center space-x-2 mb-8">
                <span className="font-bold text-xl">OpenBalti</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary flex items-center",
                      pathname === route.href ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {route.icon}
                    {route.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
