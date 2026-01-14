"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Loader2, Gift, Truck, Star, User, Tag, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCartStore, calculatePointsEarned } from "@/lib/cart-store"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ScrollReveal } from "@/components/scroll-reveal"
import type { Profile, CreatorCode } from "@/lib/types"

const accountBenefits = [
  { icon: Gift, text: "Get 10% off this order" },
  { icon: Truck, text: "Track your order status" },
  { icon: Star, text: "Earn Auroma Points (awarded after delivery)" },
  { icon: CreditCard, text: "Redeem points for store credit" },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()

  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Form fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")

  // Creator code
  const [creatorCode, setCreatorCode] = useState("")
  const [appliedCode, setAppliedCode] = useState<CreatorCode | null>(null)
  const [applyingCode, setApplyingCode] = useState(false)

  // Store credit
  const [useStoreCredit, setUseStoreCredit] = useState(false)

  const subtotal = getTotal()
  const accountDiscount = user ? subtotal * 0.1 : 0 // 10% for logged in users
  const creatorDiscount = appliedCode ? (subtotal - accountDiscount) * (appliedCode.discount_percent / 100) : 0
  const storeCreditUsed =
    useStoreCredit && profile ? Math.min(profile.store_credit, subtotal - accountDiscount - creatorDiscount) : 0
  const total = subtotal - accountDiscount - creatorDiscount - storeCreditUsed
  const pointsEarned = user ? calculatePointsEarned(total) : 0

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser({ id: user.id, email: user.email || "" })
        setEmail(user.email || "")

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profile) {
          setProfile(profile)
          setFirstName(profile.first_name || "")
          setLastName(profile.last_name || "")
          setPhone(profile.phone || "")
          setAddress(profile.address || "")
        }
      }
      setCheckingAuth(false)
    }

    checkAuth()
  }, [])

  const handleApplyCode = async () => {
    if (!creatorCode.trim()) return

    setApplyingCode(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("creator_codes")
      .select("*")
      .eq("code", creatorCode.toUpperCase())
      .eq("is_active", true)
      .single()

    if (error || !data) {
      toast.error("Invalid or expired creator code")
      setApplyingCode(false)
      return
    }

    setAppliedCode(data)
    toast.success(`Code applied! ${data.discount_percent}% off`)
    setApplyingCode(false)
  }

  const handleRemoveCode = () => {
    setAppliedCode(null)
    setCreatorCode("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          guest_email: !user ? email : null,
          first_name: firstName,
          last_name: lastName,
          phone,
          address,
          notes: notes || null,
          subtotal,
          discount: accountDiscount + creatorDiscount,
          store_credit_used: storeCreditUsed,
          total,
          creator_code_id: appliedCode?.id || null,
          points_earned: pointsEarned,
          status: "pending",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
      if (itemsError) throw itemsError

      // If user is logged in, update points and store credit
      if (user && profile) {
        // Points are awarded only when an admin marks the order as delivered.

        // Deduct store credit if used
        if (storeCreditUsed > 0) {
          await supabase.from("store_credit_transactions").insert({
            user_id: user.id,
            order_id: order.id,
            amount: -storeCreditUsed,
            type: "used",
            description: `Used on order #${order.id.slice(0, 8)}`,
          })

          await supabase
            .from("profiles")
            .update({ store_credit: profile.store_credit - storeCreditUsed })
            .eq("id", user.id)
        }

        // Update profile with address/phone if changed
        await supabase.from("profiles").update({ phone, address }).eq("id", user.id)
      }

      // Track creator code usage
      if (appliedCode) {
        await supabase.from("creator_code_usage").insert({
          creator_code_id: appliedCode.id,
          order_id: order.id,
          discount_amount: creatorDiscount,
        })

        await supabase
          .from("creator_codes")
          .update({ usage_count: appliedCode.usage_count + 1 })
          .eq("id", appliedCode.id)
      }

      // Clear cart and redirect
      clearCart()
      toast.success("Order placed successfully!")
      router.push(`/checkout/success?order=${order.id}`)
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-secondary px-4">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products before checking out.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-secondary py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollReveal>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <ScrollReveal>
            <div className="bg-background rounded-2xl shadow-sm p-6 lg:p-8">
              <h1 className="font-serif text-2xl font-bold mb-6">Checkout</h1>

              {/* Sign Up Prompt for Guests */}
              {!user && (
                <div className="mb-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <div className="flex items-start gap-3 mb-4">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-primary">Sign up for exclusive benefits!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create an account to unlock perks on this order and future purchases.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {accountBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <benefit.icon className="h-4 w-4 text-primary" />
                        <span>{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/auth/sign-up">Create Account</Link>
                  </Button>
                </div>
              )}

              {/* Logged In Status */}
              {user && (
                <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Signed in as {user.email}</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    You're getting 10% off and earning {pointsEarned} Auroma Points!
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h2 className="font-semibold text-lg mb-4">Contact Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!!user}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+961 XX XXX XXX"
                    className="mt-1.5"
                  />
                </div>

                {/* Delivery Address */}
                <div>
                  <h2 className="font-semibold text-lg mb-4">Delivery Address</h2>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="Street, Building, Floor, City, Region"
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special delivery instructions, landmarks, etc."
                    className="mt-1.5"
                  />
                </div>

                {/* Creator Code */}
                <div>
                  <h2 className="font-semibold text-lg mb-4">Creator Code</h2>
                  {appliedCode ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-700">{appliedCode.code}</span>
                        <span className="text-sm text-green-600">({appliedCode.discount_percent}% off)</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRemoveCode} className="text-green-700">
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={creatorCode}
                        onChange={(e) => setCreatorCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={handleApplyCode} disabled={applyingCode}>
                        {applyingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Store Credit */}
                {user && profile && profile.store_credit > 0 && (
                  <div>
                    <h2 className="font-semibold text-lg mb-4">Store Credit</h2>
                    <label className="flex items-center gap-3 p-3 bg-secondary rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useStoreCredit}
                        onChange={(e) => setUseStoreCredit(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span>Use store credit (${profile.store_credit.toFixed(2)} available)</span>
                    </label>
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
                  <div className="p-4 bg-secondary rounded-lg border-2 border-primary">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Place Order - ${total.toFixed(2)}</>}
                </Button>
              </form>
            </div>
          </ScrollReveal>

          {/* Order Summary */}
          <ScrollReveal delay={100}>
            <div className="bg-background rounded-2xl shadow-sm p-6 lg:p-8 lg:sticky lg:top-8">
              <h2 className="font-serif text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {accountDiscount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Account Discount (10%)</span>
                    <span>-${accountDiscount.toFixed(2)}</span>
                  </div>
                )}

                {creatorDiscount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Creator Code ({appliedCode?.discount_percent}%)</span>
                    <span>-${creatorDiscount.toFixed(2)}</span>
                  </div>
                )}

                {storeCreditUsed > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Store Credit</span>
                    <span>-${storeCreditUsed.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>

                <div className="flex items-center justify-between text-lg pt-3 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>

                {pointsEarned > 0 && (
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg mt-4">
                    <span className="text-primary font-medium">Points to Earn</span>
                    <span className="text-primary font-bold">+{pointsEarned} pts</span>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </main>
  )
}
