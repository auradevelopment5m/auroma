"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Star, Gift, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { REDEMPTION_TIERS } from "@/lib/points"
import type { Profile } from "@/lib/types"

export default function RedeemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedTier, setSelectedTier] = useState<(typeof REDEMPTION_TIERS)[0] | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(data)
      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleRedeem = async () => {
    if (!selectedTier || !profile) return

    setRedeeming(true)
    const supabase = createClient()

    try {
      // Deduct points
      const newPoints = profile.points - selectedTier.points
      const newCredit = profile.store_credit + selectedTier.credit

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          points: newPoints,
          store_credit: newCredit,
        })
        .eq("id", profile.id)

      if (profileError) throw profileError

      // Record points transaction
      await supabase.from("points_transactions").insert({
        user_id: profile.id,
        points: selectedTier.points,
        type: "redeemed",
        description: `Redeemed for $${selectedTier.credit} store credit`,
      })

      // Record store credit transaction
      await supabase.from("store_credit_transactions").insert({
        user_id: profile.id,
        amount: selectedTier.credit,
        type: "redeemed",
        points_used: selectedTier.points,
        description: `Redeemed ${selectedTier.points} points`,
      })

      // Update local state
      setProfile({ ...profile, points: newPoints, store_credit: newCredit })
      toast.success(`Successfully redeemed $${selectedTier.credit} store credit!`)
      setSelectedTier(null)
    } catch {
      toast.error("Failed to redeem points. Please try again.")
    } finally {
      setRedeeming(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </>
    )
  }

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

            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Gift className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-4">Redeem Auroma Points</h1>
              <p className="text-muted-foreground text-lg">
                Convert your points into store credit and save on your next purchase.
              </p>
            </div>
          </ScrollReveal>

          {/* Points Balance */}
          <ScrollReveal delay={100}>
            <div className="max-w-xl mx-auto mb-8">
              <div className="bg-background rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Balance</p>
                    <p className="text-2xl font-bold">{profile?.points || 0} points</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Store Credit</p>
                  <p className="text-2xl font-bold text-green-600">${profile?.store_credit?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Redemption Tiers */}
          <ScrollReveal delay={150}>
            <div className="max-w-xl mx-auto">
              <h2 className="font-semibold text-lg mb-4 text-center">Select Redemption Amount</h2>
              <div className="grid grid-cols-2 gap-4">
                {REDEMPTION_TIERS.map((tier) => {
                  const canRedeem = (profile?.points || 0) >= tier.points
                  const isSelected = selectedTier?.points === tier.points

                  return (
                    <button
                      key={tier.points}
                      onClick={() => canRedeem && setSelectedTier(tier)}
                      disabled={!canRedeem}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : canRedeem
                            ? "border-border bg-background hover:border-primary/50"
                            : "border-border bg-secondary opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold">{tier.points}</span>
                        {isSelected && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">points for</p>
                      <p className="text-3xl font-bold text-primary">${tier.credit}</p>
                      <p className="text-sm text-muted-foreground">store credit</p>
                    </button>
                  )
                })}
              </div>

              {/* Redeem Button */}
              <div className="mt-8">
                <Button onClick={handleRedeem} disabled={!selectedTier || redeeming} className="w-full" size="lg">
                  {redeeming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : selectedTier ? (
                    `Redeem ${selectedTier.points} Points for $${selectedTier.credit}`
                  ) : (
                    "Select an amount to redeem"
                  )}
                </Button>
              </div>

              {/* Info */}
              <div className="mt-8 p-4 bg-primary/10 rounded-xl">
                <h3 className="font-medium mb-2">How it works</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Store credit is automatically applied at checkout</li>
                  <li>• Credit never expires and can be combined with other discounts</li>
                  <li>• Partial credit can be used - remaining balance stays in your account</li>
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </>
  )
}
