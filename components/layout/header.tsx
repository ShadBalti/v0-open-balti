"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Menu, Search, BookOpen, Heart, User, Activity, Settings, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserDropdown } from "@/components/auth/user-dropdown"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

const publicRoutes = [
  {
    href: "/",
    label: "Home",
    icon: <BookOpen className="h-4 w-4 mr-2" />,
  },
  {
    href: "/about",
    label: "About",
    icon: <BookOpen className="h-4 w-4 mr-2" />,
  },
  {
    href: "/contributors",
    label: "Contributors",
    icon: <Users className="h-4 w-4 mr-2" />,
  },
]

const authenticatedRoutes = [
  {
    href: "/favorites",
    label: "Favorites",
    icon: <Heart className="h-4 w-4 mr-2" />,
  },
  {
    href: "/contribute",
    label: "Contribute",
    icon: <Plus className="h-4 w-4 mr-2" />,
  },
  {
    href: "/review",
    label: "My Reviews",
    icon: <Search className="h-4 w-4 mr-2" />,
  },
  {
    href: "/activity",
    label: "Activity",
    icon: <Activity className="h-4 w-4 mr-2" />,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: <User className="h-4 w-4 mr-2" />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4 mr-2" />,
  },
]

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isAuthenticated = status === "authenticated"
  const allRoutes = [...publicRoutes, ...(isAuthenticated ? authenticatedRoutes : [])]

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
          <nav className="hidden lg:flex gap-6">
            {publicRoutes.map((route) => (
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
            {isAuthenticated && (
              <>
                <div className="h-4 w-px bg-border mx-2" />
                {authenticatedRoutes.slice(0, 3).map((route) => (
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
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserDropdown />
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="pr-0">
              <Link href="/" className="flex items-center space-x-2 mb-8">
                <span className="font-bold text-xl">OpenBalti</span>
              </Link>
              <nav className="flex flex-col gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">General</h4>
                  {publicRoutes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary flex items-center py-2",
                        pathname === route.href ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {route.icon}
                      {route.label}
                    </Link>
                  ))}
                </div>

                {isAuthenticated && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">My Account</h4>
                    {authenticatedRoutes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary flex items-center py-2",
                          pathname === route.href ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {route.icon}
                        {route.label}
                      </Link>
                    ))}
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="space-y-3 pt-4 border-t">
                    <Button asChild className="w-full">
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
