import { createServerSupabaseClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Blog | Auroma",
  description: "Discover aromatherapy tips, wellness guides, and the latest from Auroma.",
}

async function getBlogPosts() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
  return data || []
}

async function getFeaturedPost() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .limit(1)
    .single()
  return data
}

export default async function BlogPage() {
  const [posts, featuredPost] = await Promise.all([getBlogPosts(), getFeaturedPost()])

  const regularPosts = posts.filter((p) => p.id !== featuredPost?.id)

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 animate-fade-in">
              The Auroma Journal
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in-delay">
              Explore the world of aromatherapy, wellness tips, and lifestyle inspiration
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <span className="text-primary text-sm font-medium uppercase tracking-wider">Featured Article</span>
            <Link href={`/blog/${featuredPost.slug}`} className="group mt-4 block">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-muted">
                  <img
                    src={featuredPost.image_url || "/placeholder.svg?height=400&width=600&query=aromatherapy wellness"}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredPost.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredPost.read_time || 5} min read
                    </span>
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <NewsletterSignup />
        </div>
      </section>

      {/* All Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-8">Latest Articles</h2>

          {regularPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <article className="h-full flex flex-col bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={post.image_url || "/placeholder.svg?height=300&width=400&query=aromatherapy blog"}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.read_time || 5} min
                        </span>
                      </div>
                      <h3 className="text-lg font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{post.excerpt}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm text-primary font-medium group-hover:gap-3 transition-all">
                        Read more <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      </main>
      <Footer />
    </>
  )
}
