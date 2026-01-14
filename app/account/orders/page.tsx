import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Button } from "@/components/ui/button"
import { Package, ArrowLeft, ChevronRight } from "lucide-react"
import type { Order } from "@/lib/types"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-cyan-100 text-cyan-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const typedOrders = (orders || []) as Order[]

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-20 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <ScrollReveal>
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Account
            </Link>

            <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-8">Your Orders</h1>
          </ScrollReveal>

          {typedOrders.length === 0 ? (
            <ScrollReveal delay={100}>
              <div className="bg-background rounded-xl p-12 shadow-sm text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-bold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
                <Button asChild>
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            </ScrollReveal>
          ) : (
            <div className="space-y-4">
              {typedOrders.map((order, index) => (
                <ScrollReveal key={order.id} delay={index * 50}>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="block bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Placed on{" "}
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        {order.points_earned > 0 && (
                          <p className="text-sm text-primary mt-1">
                            +{order.points_earned} points {order.status === "delivered" ? "awarded" : "pending (awarded after delivery)"}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                          {order.discount > 0 && (
                            <p className="text-sm text-green-600">Saved ${order.discount.toFixed(2)}</p>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
