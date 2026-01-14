import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Button } from "@/components/ui/button"
import { Package, Star, CreditCard, User, ChevronRight, Gift, LogOut } from "lucide-react"
import type { Order, Profile } from "@/lib/types"

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [{ data: profile }, { data: orders }, { data: recentPoints }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
    supabase
      .from("points_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const typedProfile = profile as Profile | null
  const typedOrders = (orders || []) as Order[]

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-20 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {/* Header */}
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-serif text-3xl lg:text-4xl font-bold">
                  Welcome back, {typedProfile?.first_name || "there"}!
                </h1>
                <p className="text-muted-foreground mt-1">{user.email}</p>
              </div>
              <form action="/api/auth/sign-out" method="POST">
                <Button variant="outline" type="submit" className="bg-transparent">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </form>
            </div>
          </ScrollReveal>

          {/* Stats Cards */}
          <ScrollReveal delay={100}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-background rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{typedProfile?.points || 0}</p>
                    <p className="text-sm text-muted-foreground">Auroma Points</p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${typedProfile?.store_credit?.toFixed(2) || "0.00"}</p>
                    <p className="text-sm text-muted-foreground">Store Credit</p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-auroma-deep/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-auroma-deep" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{typedOrders.length}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <ScrollReveal delay={150}>
              <div className="bg-background rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Link
                    href="/account/orders"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <span>View All Orders</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/account/points"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-muted-foreground" />
                      <span>Points History</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/redeem"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-muted-foreground" />
                      <span>Redeem Points</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/account/profile"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span>Edit Profile</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* Recent Orders */}
            <ScrollReveal delay={200}>
              <div className="lg:col-span-2 bg-background rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">Recent Orders</h2>
                  <Link href="/account/orders" className="text-sm text-primary hover:underline">
                    View All
                  </Link>
                </div>

                {typedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/products">Start Shopping</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {typedOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/account/orders/${order.id}`}
                        className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors"
                      >
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-primary/10 text-primary"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* Points Activity */}
          {recentPoints && recentPoints.length > 0 && (
            <ScrollReveal delay={250}>
              <div className="mt-8 bg-background rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">Recent Points Activity</h2>
                  <Link href="/account/points" className="text-sm text-primary hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentPoints.map(
                    (transaction: {
                      id: string
                      type: string
                      points: number
                      description: string | null
                      created_at: string
                    }) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{transaction.description || "Points transaction"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`font-bold ${transaction.type === "earned" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "earned" ? "+" : "-"}
                          {transaction.points} pts
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
