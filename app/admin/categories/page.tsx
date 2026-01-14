import { createServerSupabaseClient } from "@/lib/supabase/server"
import { CategoryManager } from "@/components/admin/category-manager"

async function getCategories() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from("categories").select("*").order("name")
  return data || []
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories()
  return (
    <div className="p-8">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Categories</h1>
      <p className="text-muted-foreground mb-8">Edit category images and details</p>
      <CategoryManager categories={categories} />
    </div>
  )
}
