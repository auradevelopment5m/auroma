import { Leaf, Sparkles, Heart, Shield } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"

const benefits = [
  {
    icon: Leaf,
    title: "100% Natural",
    description: "Pure, therapeutic-grade essential oils sourced from the finest botanicals worldwide.",
  },
  {
    icon: Sparkles,
    title: "Premium Quality",
    description: "Expertly crafted diffusers with advanced ultrasonic technology for optimal mist distribution.",
  },
  {
    icon: Heart,
    title: "Wellness Focused",
    description: "Designed to enhance your well-being through the power of aromatherapy.",
  },
  {
    icon: Shield,
    title: "Safe & Reliable",
    description: "All products undergo rigorous testing to ensure safety and longevity.",
  },
]

export function BenefitsSection() {
  return (
    <section className="py-20 lg:py-32 bg-background text-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">Why Choose Auroma?</h2>
            <p className="text-foreground/70 text-lg">
              Experience the difference of premium aromatherapy products designed with care and expertise.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <ScrollReveal key={benefit.title} delay={index * 100}>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 text-primary mb-6 group-hover:scale-110 transition-transform">
                  <benefit.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-xl mb-3">{benefit.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{benefit.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
