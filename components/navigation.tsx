"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingBag, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useCartStore } from "@/lib/cart-store"
import { CartDrawer } from "@/components/cart-drawer"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/products?category=home-diffusers", label: "Home Diffusers" },
  { href: "/products?category=car-diffusers", label: "Car Diffusers" },
  { href: "/products?category=essential-oils", label: "Essential Oils" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { setIsOpen, getItemCount } = useCartStore()
  const itemCount = getItemCount()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isHomePage = pathname === "/"

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled || !isHomePage ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent",
        )}
      >
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/logo.png"
                alt="Auroma"
                className="h-12 lg:h-20 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    "text-foreground/80 hover:text-foreground",
                    pathname === link.href && "text-primary",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 lg:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "hidden lg:flex",
                  "text-foreground hover:bg-secondary/20",
                )}
              >
                <Search className="h-5 w-5" />
              </Button>

              <Link href="/account" className="hidden lg:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-foreground hover:bg-secondary/20",
                  )}
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative",
                  "text-foreground hover:bg-secondary/20",
                )}
                onClick={() => setIsOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-foreground hover:bg-secondary/20",
                    )}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col gap-6 p-6">
                    <Link href="/" className="font-serif text-2xl font-bold text-center" onClick={() => setMobileOpen(false)}>
                      Auroma
                    </Link>

                    {/* Mobile Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full h-11 pl-10 pr-4 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "h-11 rounded-lg px-4 flex items-center justify-center text-base font-medium border border-border bg-background transition-colors hover:bg-secondary/60 hover:text-primary",
                            pathname === link.href && "border-primary/40 text-primary",
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t pt-5 space-y-3">
                      <Link href="/account" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full h-11 rounded-lg justify-center gap-2">
                          <User className="h-4 w-4" />
                          My Account
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-lg justify-center gap-2"
                        onClick={() => {
                          setIsOpen(true)
                          setMobileOpen(false)
                        }}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Cart ({itemCount})
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>
      <CartDrawer />
    </>
  )
}
