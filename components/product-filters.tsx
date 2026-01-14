"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types"

interface ProductFiltersProps {
  categories: Category[]
  selectedCategory?: string
  selectedSort?: string
}

export function ProductFilters({ categories, selectedCategory, selectedSort }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Sort - Mobile */}
      <div className="lg:hidden">
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <Select value={selectedSort || ""} onValueChange={(v) => updateFilter("sort", v || null)}>
          <SelectTrigger>
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-4">Categories</h3>
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className={cn(
              "justify-start px-3 h-10",
              !selectedCategory && "bg-primary/10 text-primary hover:bg-primary/20",
            )}
            onClick={() => updateFilter("category", null)}
          >
            All Products
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className={cn(
                "justify-start px-3 h-10",
                selectedCategory === category.slug && "bg-primary/10 text-primary hover:bg-primary/20",
              )}
              onClick={() => updateFilter("category", category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Sort - Desktop */}
      <div className="hidden lg:block">
        <h3 className="font-semibold mb-4">Sort By</h3>
        <div className="flex flex-col gap-2">
          {[
            { value: "", label: "Newest" },
            { value: "price-asc", label: "Price: Low to High" },
            { value: "price-desc", label: "Price: High to Low" },
            { value: "name", label: "Name" },
          ].map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              className={cn(
                "justify-start px-3 h-10",
                (selectedSort || "") === option.value && "bg-primary/10 text-primary hover:bg-primary/20",
              )}
              onClick={() => updateFilter("sort", option.value || null)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedCategory || selectedSort) && (
        <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/products")}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}
