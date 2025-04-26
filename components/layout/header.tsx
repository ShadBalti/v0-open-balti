"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MoonIcon, SunIcon, MenuIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-4">
                <Link
                  href="/"
                  className={`transition-colors px-2 py-1 rounded-md hover:bg-muted ${
                    isActive("/") ? "text-primary font-medium" : "text-foreground"
                  }`}
                >
                  Dictionary
                </Link>
                <Link
                  href="/about"
                  className={`transition-colors px-2 py-1 rounded-md hover:bg-muted ${
                    isActive("/about") ? "text-primary font-medium" : "text-foreground"
                  }`}
                >
                  About Balti
                </Link>
                <Link
                  href="/contribute"
                  className={`transition-colors px-2 py-1 rounded-md hover:bg-muted ${
                    isActive("/contribute") ? "text-primary font-medium" : "text-foreground"
                  }`}
                >
                  Contribute
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              OpenBalti
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/"
            className={`transition-colors ${
              isActive("/") ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
            }`}
          >
            Dictionary
          </Link>
          <Link
            href="/about"
            className={`transition-colors ${
              isActive("/about") ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
            }`}
          >
            About Balti
          </Link>
          <Link
            href="/contribute"
            className={`transition-colors ${
              isActive("/contribute") ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
            }`}
          >
            Contribute
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
