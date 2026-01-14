import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BlogPostManager } from "@/components/admin/blog-post-manager"

async function getBlogPosts() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })
  return data || []
}

export default async function AdminBlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Blog Posts</h1>
        <p className="text-muted-foreground">Manage your blog content</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <BlogPostManager posts={posts} />
        </CardContent>
      </Card>
    </div>
  )
}
