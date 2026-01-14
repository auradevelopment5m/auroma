import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductManager } from "@/components/admin/product-manager"

async function getProducts() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false })
  return data || []
}

async function getCategories() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from("categories").select("*").order("name")
  return data || []
}

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground">Manage your product catalog</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductManager products={products} categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}
