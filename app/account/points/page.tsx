import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, TrendingUp, Gift } from "lucide-react"
import type { Profile, PointsTransaction } from "@/lib/types"
import { REDEMPTION_TIERS } from "@/lib/points"

export default async function PointsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("points_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ])

  const typedProfile = profile as Profile | null
  const typedTransactions = (transactions || []) as PointsTransaction[]

  // Calculate totals
  const totalEarned = typedTransactions.filter((t) => t.type === "earned").reduce((sum, t) => sum + t.points, 0)

  const totalRedeemed = typedTransactions.filter((t) => t.type === "redeemed").reduce((sum, t) => sum + t.points, 0)

  const tiers = Array.isArray(REDEMPTION_TIERS) ? REDEMPTION_TIERS : []

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

            <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-8">Auroma Points</h1>
          </ScrollReveal>

          {/* Points Overview */}
          <ScrollReveal delay={100}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-background rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{typedProfile?.points || 0}</p>
                    <p className="text-sm text-muted-foreground">Available Points</p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{totalEarned}</p>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Gift className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{totalRedeemed}</p>
                    <p className="text-sm text-muted-foreground">Total Redeemed</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Points History */}
            <ScrollReveal delay={150}>
              <div className="lg:col-span-2 bg-background rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Points History</h2>

                {typedTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No points activity yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Start shopping to earn points!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {typedTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary transition-colors"
                      >
                        <div>
                          <p className="font-medium">{transaction.description || "Points transaction"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span
                          className={`text-lg font-bold ${
                            transaction.type === "earned" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "earned" ? "+" : "-"}
                          {transaction.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Redemption Options */}
            <ScrollReveal delay={200}>
              <div className="bg-background rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Redeem Points</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Convert your Auroma Points into store credit to use on your next purchase.
                </p>

                <div className="space-y-3 mb-6">
                  {tiers.map((tier) => (
                    <div
                      key={tier.points}
                      className={`p-4 rounded-lg border ${
                        (typedProfile?.points || 0) >= tier.points
                          ? "border-primary bg-primary/5"
                          : "border-border opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{tier.points} pts</span>
                        <span className="text-primary font-bold">${tier.credit} credit</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button asChild className="w-full">
                  <Link href="/redeem">Redeem Now</Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>

          {/* How to Earn */}
          <ScrollReveal delay={250}>
            <div className="mt-8 bg-background rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">How to Earn Points</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">+10</span>
                  </div>
                  <p className="font-medium">$5 - $40</p>
                  <p className="text-sm text-muted-foreground">Orders in this range</p>
                </div>
                <div className="text-center p-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">+20</span>
                  </div>
                  <p className="font-medium">$41 - $75</p>
                  <p className="text-sm text-muted-foreground">Orders in this range</p>
                </div>
                <div className="text-center p-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">+50</span>
                  </div>
                  <p className="font-medium">$76+</p>
                  <p className="text-sm text-muted-foreground">Orders above this</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </>
  )
}
