import Link from "next/link"
import { CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-background rounded-2xl shadow-lg p-8">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="font-serif text-2xl font-bold mb-2">Account Created!</h1>
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify
            your account.
          </p>

          <div className="flex items-center justify-center gap-2 p-4 bg-secondary rounded-lg mb-6">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Check your email to verify</span>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">Continue to Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
