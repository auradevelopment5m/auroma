import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailCampaignManager } from "@/components/admin/email-campaign-manager"
import { requireAdmin } from "@/lib/support/server-auth"

async function getSubscribers() {
  const { admin } = await requireAdmin()

  const { data, count, error } = await admin
    .from("email_subscribers")
    .select("*", { count: "exact" })
    .order("subscribed_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }
  return { subscribers: data || [], count: count || 0 }
}

export default async function EmailCampaignsPage() {
  const { subscribers, count } = await getSubscribers()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Email Campaigns</h1>
        <p className="text-muted-foreground">Send emails to your subscribers</p>
      </div>

      <div className="grid gap-6">
        {/* Subscribers Stats */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Subscribers ({count})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto">
              {subscribers.length === 0 ? (
                <p className="text-muted-foreground">No subscribers yet</p>
              ) : (
                <div className="space-y-2">
                  {subscribers.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-foreground">{sub.email}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(sub.subscribed_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Composer */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Compose Email</CardTitle>
          </CardHeader>
          <CardContent>
            <EmailCampaignManager subscriberCount={count} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
