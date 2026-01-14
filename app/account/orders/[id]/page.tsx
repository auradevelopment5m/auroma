import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { ArrowLeft, Package, MapPin, Phone, Mail, FileText, CheckCircle, Clock, Truck } from "lucide-react"
import type { Order, OrderItem } from "@/lib/types"

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"]

const statusIcons: Record<string, typeof CheckCircle> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    notFound()
  }

  const typedOrder = order as Order & { order_items: OrderItem[] }
  const currentStepIndex = statusSteps.indexOf(typedOrder.status)

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-20 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <ScrollReveal>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-serif text-3xl font-bold">Order #{typedOrder.id.slice(0, 8).toUpperCase()}</h1>
                <p className="text-muted-foreground mt-1">
                  Placed on{" "}
                  {new Date(typedOrder.created_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Status */}
            <ScrollReveal delay={100}>
              <div className="lg:col-span-2 bg-background rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-lg mb-6">Order Status</h2>

                {typedOrder.status === "cancelled" ? (
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-red-700 font-medium">This order has been cancelled</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex justify-between mb-8">
                      {statusSteps.map((step, index) => {
                        const Icon = statusIcons[step]
                        const isComplete = index <= currentStepIndex
                        const isCurrent = index === currentStepIndex

                        return (
                          <div key={step} className="flex flex-col items-center relative z-10">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                isComplete ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                              } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <p
                              className={`text-xs mt-2 capitalize ${isComplete ? "text-primary font-medium" : "text-muted-foreground"}`}
                            >
                              {step}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <h3 className="font-semibold mt-8 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {typedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                      <div className="h-16 w-16 rounded-lg bg-background flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.product_price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Order Summary & Details */}
            <div className="space-y-6">
              <ScrollReveal delay={150}>
                <div className="bg-background rounded-xl p-6 shadow-sm">
                  <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${typedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {typedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${typedOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {typedOrder.store_credit_used > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Store Credit</span>
                        <span>-${typedOrder.store_credit_used.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold">${typedOrder.total.toFixed(2)}</span>
                    </div>
                    {typedOrder.points_earned > 0 && (
                      <div className="flex justify-between p-3 bg-primary/10 rounded-lg mt-2">
                        <span className="text-primary font-medium">
                          Points {typedOrder.status === "delivered" ? "awarded" : "pending (awarded after delivery)"}
                        </span>
                        <span className="text-primary font-bold">+{typedOrder.points_earned} pts</span>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="bg-background rounded-xl p-6 shadow-sm">
                  <h2 className="font-semibold text-lg mb-4">Delivery Details</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {typedOrder.first_name} {typedOrder.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{typedOrder.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm">{typedOrder.phone}</p>
                    </div>
                    {typedOrder.guest_email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <p className="text-sm">{typedOrder.guest_email}</p>
                      </div>
                    )}
                    {typedOrder.notes && (
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-muted-foreground">{typedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={250}>
                <div className="bg-background rounded-xl p-6 shadow-sm">
                  <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <Truck className="h-5 w-5 text-primary" />
                    <span>Cash on Delivery</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
