import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreatorCodesManager } from "@/components/admin/creator-codes-manager"

async function getCreatorCodes() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from("creator_codes").select("*").order("created_at", { ascending: false })
  return data || []
}

async function getCodeUsageStats() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from("creator_code_usage").select("creator_code_id, discount_amount, orders(total)")

  const stats: Record<string, { uses: number; totalDiscount: number; totalRevenue: number }> = {}

  data?.forEach((usage: any) => {
    const codeId = usage.creator_code_id
    if (!stats[codeId]) {
      stats[codeId] = { uses: 0, totalDiscount: 0, totalRevenue: 0 }
    }
    stats[codeId].uses++
    stats[codeId].totalDiscount += Number(usage.discount_amount)
    stats[codeId].totalRevenue += Number(usage.orders?.total || 0)
  })

  return stats
}

export default async function CreatorCodesPage() {
  const [codes, usageStats] = await Promise.all([getCreatorCodes(), getCodeUsageStats()])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Creator Codes</h1>
        <p className="text-muted-foreground">Manage discount codes for creators and affiliates</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Creator Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatorCodesManager codes={codes} usageStats={usageStats} />
        </CardContent>
      </Card>
    </div>
  )
}
