"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, CheckCircle, Send } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["Beirut, Lebanon", "Downtown District"],
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+961 1 234 567", "+961 3 456 789"],
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["hello@auroma.com", "support@auroma.com"],
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Mon - Fri: 9AM - 6PM", "Sat: 10AM - 4PM"],
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-primary text-sm font-medium uppercase tracking-wider animate-fade-in">
              Get in Touch
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-serif font-bold text-foreground animate-fade-in-delay">
              We&apos;d Love to Hear From You
            </h1>
            <p className="mt-6 text-lg text-muted-foreground animate-fade-in-delay-2">
              Have questions about our products or need assistance? Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div
                key={info.title}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <info.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-serif font-bold text-foreground mb-2">{info.title}</h3>
                {info.details.map((detail) => (
                  <p key={detail} className="text-muted-foreground text-sm">
                    {detail}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Send Us a Message</h2>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-6">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-3">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. We&apos;ll get back to you within 24-48 hours.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)} variant="outline">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-foreground">
                        Your Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                        className="bg-background border-border mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                        className="bg-background border-border mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-foreground">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      required
                      className="bg-background border-border mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-foreground">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      required
                      className="bg-background border-border mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Map / Location Visual */}
            <div className="flex flex-col gap-6">
              <div className="aspect-video rounded-2xl overflow-hidden bg-muted">
                <img
                  src="/beirut-lebanon-city-map-location.jpg"
                  alt="Auroma Location - Beirut, Lebanon"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-serif font-bold text-foreground mb-4">Visit Our Showroom</h3>
                <p className="text-muted-foreground mb-4">
                  Experience our full range of diffusers and essential oils in person. Our knowledgeable staff can help
                  you find the perfect products for your needs.
                </p>
                <div className="p-4 rounded-xl bg-primary/10">
                  <p className="text-sm text-primary font-medium">
                    Walk-ins welcome during business hours. For appointments outside regular hours, please contact us in
                    advance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Before reaching out, you might find your answer in our commonly asked questions.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl bg-background border border-border">
              <h4 className="font-medium text-foreground mb-2">Shipping & Delivery</h4>
              <p className="text-sm text-muted-foreground">We deliver across Lebanon with Cash on Delivery.</p>
            </div>
            <div className="p-6 rounded-xl bg-background border border-border">
              <h4 className="font-medium text-foreground mb-2">Returns & Exchanges</h4>
              <p className="text-sm text-muted-foreground">30-day return policy on unopened products.</p>
            </div>
            <div className="p-6 rounded-xl bg-background border border-border">
              <h4 className="font-medium text-foreground mb-2">Product Care</h4>
              <p className="text-sm text-muted-foreground">Tips on maintaining your diffuser for longevity.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
