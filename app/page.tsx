import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { CategoryShowcase } from "@/components/category-showcase"
import { FeaturedProducts } from "@/components/featured-products"
import { BenefitsSection } from "@/components/benefits-section"
import { TestimonialsSection } from "@/components/testimonials-section"

export default async function HomePage() {

  // Hardcoded categories with static images
  const categories = [
    {
      id: "1",
      name: "Home Diffusers",
      slug: "homediff",
      description: "Transform your space with our premium home diffusers.",
      image_url: "/category-images/homediff.png",
      created_at: ""
    },
    {
      id: "2",
      name: "Car Diffusers",
      slug: "cardiff",
      description: "Aromatherapy on the go with our car diffusers.",
      image_url: "/category-images/cardiff.png",
      created_at: ""
    },
    {
      id: "3",
      name: "Oils",
      slug: "oils",
      description: "Pure essential oils for every mood and need.",
      image_url: "/category-images/oils.png",
      created_at: ""
    }
  ];

  // Still fetch products as before
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("in_stock", true)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <CategoryShowcase categories={categories} />
        <FeaturedProducts products={products || []} />
        <BenefitsSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  )
}
