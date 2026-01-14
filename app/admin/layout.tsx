import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, ShoppingCart, Package, Ticket, Mail, FileText, LogOut, ChevronLeft, MessagesSquare } from "lucide-react"

async function checkAdminAccess() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  try {
    const admin = createAdminSupabaseClient()
    const { data: profile } = await admin.from("profiles").select("is_admin").eq("id", user.id).single()
    return profile?.is_admin === true
  } catch {
    return false
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    redirect("/")
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/creator-codes", icon: Ticket, label: "Creator Codes" },
    { href: "/admin/support", icon: MessagesSquare, label: "Support Chat" },
    { href: "/admin/emails", icon: Mail, label: "Email Campaigns" },
    { href: "/admin/blog", icon: FileText, label: "Blog Posts" },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back to Store</span>
          </Link>
          <h1 className="mt-4 text-xl font-serif font-bold text-foreground">Auroma Admin</h1>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <form action="/api/auth/sign-out" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
