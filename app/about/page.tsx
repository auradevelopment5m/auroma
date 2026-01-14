import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Leaf, Heart, Sparkles, Users, Award, Globe } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "About Us | Auroma",
  description: "Discover the story behind Auroma and our mission to bring aromatherapy wellness to everyone.",
}

export default function AboutPage() {
  const values = [
    {
      icon: Leaf,
      title: "Natural Ingredients",
      description: "We source only the finest natural essential oils from trusted suppliers worldwide.",
    },
    {
      icon: Heart,
      title: "Wellness First",
      description: "Every product is designed with your wellbeing in mind, promoting relaxation and balance.",
    },
    {
      icon: Sparkles,
      title: "Quality Craftsmanship",
      description: "Our diffusers are meticulously engineered for optimal performance and durability.",
    },
  ]

  const stats = [
    { value: "50K+", label: "Happy Customers" },
    { value: "100%", label: "Natural Oils" },
    { value: "30+", label: "Essential Oil Blends" },
    { value: "4.9", label: "Average Rating" },
  ]

  const team = [
    {
      name: "Sarah Mitchell",
      role: "Founder & CEO",
      image: "/professional-woman-portrait.png",
    },
    {
      name: "David Chen",
      role: "Head of Product",
      image: "/professional-man-portrait.png",
    },
    {
      name: "Maya Patel",
      role: "Aromatherapist",
      image: "/professional-woman-aromatherapist.jpg",
    },
  ]

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-primary text-sm font-medium uppercase tracking-wider animate-fade-in">Our Story</span>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground animate-fade-in-delay">
              Bringing Serenity to Every Space
            </h1>
            <p className="mt-6 text-lg text-muted-foreground animate-fade-in-delay-2">
              Founded with a passion for wellness and a love for natural scents, Auroma is dedicated to transforming how
              you experience aromatherapy in your daily life.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Our Mission</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-foreground">
                Making Aromatherapy Accessible to Everyone
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                We believe that everyone deserves to experience the transformative power of aromatherapy. Whether
                you&apos;re unwinding after a long day at home or seeking calm during your commute, Auroma brings the
                benefits of essential oils to every moment of your life.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Our journey began in Lebanon, where we saw an opportunity to blend traditional aromatherapy wisdom with
                modern design. Today, we continue to innovate, creating diffusers that are as beautiful as they are
                functional.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/products">Explore Products</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">Get in Touch</Link>
                </Button>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                <img src="/aromatherapy-essential-oils-diffuser-lifestyle.jpg" alt="Auroma products" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary text-sm font-medium uppercase tracking-wider">Our Values</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-foreground">What We Stand For</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-4xl md:text-5xl font-serif font-bold text-primary">{stat.value}</p>
                <p className="mt-2 text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary text-sm font-medium uppercase tracking-wider">Our Team</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-foreground">Meet the Creators</h2>
            <p className="mt-4 text-muted-foreground">
              Passionate individuals dedicated to bringing wellness into your life
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div
                key={member.name}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-6">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-serif font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Award className="w-8 h-8 text-primary" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Globe className="w-8 h-8 text-primary" />
              <span>Worldwide Sourcing</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="w-8 h-8 text-primary" />
              <span>Trusted by Thousands</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
            Ready to Transform Your Space?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore our collection of premium diffusers and essential oils, crafted to bring serenity to your everyday
            life.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      </section>
      </main>
      <Footer />
    </>
  )
}
