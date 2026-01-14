import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { ScrollReveal } from "@/components/scroll-reveal"
import type { Category, Product } from "@/lib/types"

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const [{ data: categories }, { data: allProducts }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("products").select("*, category:categories(*)").order("created_at", { ascending: false }),
  ])

  // Filter by category
  let filteredProducts = allProducts || []
  if (params.category) {
    filteredProducts = filteredProducts.filter(
      (p: Product & { category: Category }) => p.category?.slug === params.category,
    )
  }

  // Sort products
  if (params.sort === "price-asc") {
    filteredProducts.sort((a: Product, b: Product) => a.price - b.price)
  } else if (params.sort === "price-desc") {
    filteredProducts.sort((a: Product, b: Product) => b.price - a.price)
  } else if (params.sort === "name") {
    filteredProducts.sort((a: Product, b: Product) => a.name.localeCompare(b.name))
  }

  const selectedCategory = categories?.find((c: Category) => c.slug === params.category)

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-20">
        {/* Hero Banner */}
        <section className="bg-background text-foreground py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <ScrollReveal>
              <div className="max-w-2xl">
                <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4">
                  {selectedCategory ? selectedCategory.name : "All Products"}
                </h1>
                <p className="text-foreground/70 text-lg">
                  {selectedCategory
                    ? selectedCategory.description
                    : "Discover our complete collection of premium diffusers and essential oils."}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className="lg:w-64 shrink-0">
                <Suspense fallback={<div className="animate-pulse bg-secondary h-96 rounded-lg" />}>
                  <ProductFilters
                    categories={categories || []}
                    selectedCategory={params.category}
                    selectedSort={params.sort}
                  />
                </Suspense>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> products
                  </p>
                </div>

                <Suspense
                  fallback={
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-square bg-secondary rounded-xl mb-4" />
                          <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                          <div className="h-4 bg-secondary rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  }
                >
                  <ProductGrid products={filteredProducts} />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
