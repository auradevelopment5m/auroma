import Link from "next/link"
import { CheckCircle, Package, Home, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { order } = await searchParams
  const orderId = order?.slice(0, 8).toUpperCase() || "XXXXXXXX"

  return (
    <main className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-lg text-center">
        <div className="bg-background rounded-2xl shadow-lg p-8">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="font-serif text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">Thank you for shopping with Auroma.</p>

          <div className="bg-secondary rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-medium">Order #{orderId}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              We've received your order and will process it shortly. You'll receive updates via email.
            </p>
          </div>

          <div className="bg-primary/10 rounded-xl p-4 mb-6">
            <p className="text-sm text-primary font-medium">Payment: Cash on Delivery</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please have the exact amount ready when your order arrives.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/account/orders">
                <User className="mr-2 h-4 w-4" />
                Track Your Order
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
