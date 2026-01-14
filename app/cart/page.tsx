"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useCartStore, calculatePointsEarned } from "@/lib/cart-store"
import { ScrollReveal } from "@/components/scroll-reveal"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const total = getTotal()
  const pointsEarned = calculatePointsEarned(total)

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-20">
        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-8">
                <h1 className="font-serif text-3xl lg:text-4xl font-bold">Shopping Cart</h1>
                {items.length > 0 && (
                  <Button variant="ghost" className="text-muted-foreground" onClick={clearCart}>
                    Clear Cart
                  </Button>
                )}
              </div>
            </ScrollReveal>

            {items.length === 0 ? (
              <ScrollReveal>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mb-6">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold mb-2">Your cart is empty</h2>
                  <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
                  <Button asChild size="lg">
                    <Link href="/products">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </ScrollReveal>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item, index) => (
                    <ScrollReveal key={item.id} delay={index * 50}>
                      <div className="flex gap-4 p-4 bg-secondary rounded-xl">
                        <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-lg overflow-hidden bg-background shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.id}`} className="hover:text-primary transition-colors">
                            <h3 className="font-medium text-lg truncate">{item.name}</h3>
                          </Link>
                          <p className="text-muted-foreground mt-1">${item.price.toFixed(2)}</p>

                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center border rounded-lg bg-background">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-secondary transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-4 font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-secondary transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <ScrollReveal delay={200}>
                    <div className="bg-secondary rounded-xl p-6 sticky top-24">
                      <h2 className="font-serif text-xl font-bold mb-6">Order Summary</h2>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">${total.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="text-sm text-muted-foreground">Calculated at checkout</span>
                        </div>

                        {pointsEarned > 0 && (
                          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                            <span className="text-primary font-medium text-sm">Earn Auroma Points (awarded after delivery)</span>
                            <span className="text-primary font-bold">+{pointsEarned} pts</span>
                          </div>
                        )}

                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between text-lg">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold">${total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <Button asChild className="w-full" size="lg">
                          <Link href="/checkout">Proceed to Checkout</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href="/products">Continue Shopping</Link>
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground text-center mt-4">
                        Cash on Delivery available for Lebanon
                      </p>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
